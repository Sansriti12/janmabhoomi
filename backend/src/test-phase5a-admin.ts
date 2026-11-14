import crypto from "node:crypto";
import { buildApp } from "./app.js";
import { hashPassword } from "./services/passwordService.js";

async function runPhase5ATests() {
  console.log("==================================================================");
  console.log("  JANMABHOOMI PHASE 5A — UNIFIED ADMIN PANEL FOUNDATION TESTS    ");
  console.log("==================================================================");

  const app = buildApp();
  await app.ready();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  let adminToken = "";
  let editorToken = "";
  let testEditorId = "";

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Admin Authentication & Token Generation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 1: STAFF AUTHENTICATION ---");

    // Invalid credentials check
    const invalidRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: "admin@janmabhoomi.in",
        password: "WrongPassword123!",
      },
    });
    assert(invalidRes.statusCode === 401, "Invalid password returns HTTP 401");

    // Valid admin login
    const adminLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: "admin@janmabhoomi.in",
        password: "AdminSuperSecret@2026!",
      },
    });
    assert(adminLoginRes.statusCode === 200, "Valid Admin login returns HTTP 200");
    const adminData = JSON.parse(adminLoginRes.body);
    adminToken = adminData.data.token;
    assert(adminData.data.user.role === "Admin", "Admin user receives unified role 'Admin'");
    assert(
      Array.isArray(adminData.data.user.permittedPublications) &&
        adminData.data.user.permittedPublications.length === 2 &&
        adminData.data.user.permittedPublications.includes("pub-janmabhoomi") &&
        adminData.data.user.permittedPublications.includes("pub-pravasi"),
      "Permitted publications list contains strictly the TWO newspapers: pub-janmabhoomi and pub-pravasi"
    );

    // Profile verification endpoint
    const meRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/auth/me",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(meRes.statusCode === 200, "GET /api/v1/admin/auth/me returns HTTP 200");
    assert(JSON.parse(meRes.body).data.role === "Admin", "Profile confirms role 'Admin'");

    // ------------------------------------------------------------------------
    // TEST 2: Admin Staff Management & Role Assignment
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 2: ADMIN STAFF MANAGEMENT ---");

    const staffListRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/staff",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(staffListRes.statusCode === 200, "Admin can list all staff accounts (HTTP 200)");

    // Clean up test editor if existed previously
    await app.prisma.user.deleteMany({
      where: { email: "editor.test@janmabhoomi.in" },
    });

    // Create a new staff account with 'Editor' role
    const createStaffRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/staff",
      headers: { authorization: `Bearer ${adminToken}` },
      payload: {
        fullName: "Test Editorial Desk",
        email: "editor.test@janmabhoomi.in",
        password: "EditorSecurePassword2026!",
        role: "Editor",
      },
    });
    assert(createStaffRes.statusCode === 201, "Admin creates new staff member with Editor role (HTTP 201)");
    const createdEditor = JSON.parse(createStaffRes.body);
    testEditorId = createdEditor.data.id;
    assert(createdEditor.data.role === "Editor", "Created staff member is assigned role 'Editor'");

    // ------------------------------------------------------------------------
    // TEST 3: RBAC Enforcement & Editor Role Isolation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 3: RBAC ENFORCEMENT & EDITOR ISOLATION ---");

    // Login as Editor
    const editorLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: "editor.test@janmabhoomi.in",
        password: "EditorSecurePassword2026!",
      },
    });
    assert(editorLoginRes.statusCode === 200, "Editor login returns HTTP 200");
    const editorData = JSON.parse(editorLoginRes.body);
    editorToken = editorData.data.token;
    assert(editorData.data.user.role === "Editor", "Editor user receives unified role 'Editor'");

    // Editor attempts to access staff management -> MUST be blocked
    const editorStaffAccessRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/staff",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(
      editorStaffAccessRes.statusCode === 403,
      "Editor is blocked from staff management (HTTP 403 Forbidden)"
    );

    // Editor attempts to create staff -> MUST be blocked
    const editorStaffCreateRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/staff",
      headers: { authorization: `Bearer ${editorToken}` },
      payload: {
        fullName: "Unauthorized User",
        email: "unauth@janmabhoomi.in",
        password: "SomePassword123!",
        role: "Admin",
      },
    });
    assert(
      editorStaffCreateRes.statusCode === 403,
      "Editor cannot create staff accounts (HTTP 403 Forbidden)"
    );

    // Editor attempts to access financial transactions -> MUST be blocked
    const editorPaymentAccessRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/payments/transactions",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(
      editorPaymentAccessRes.statusCode === 403,
      "Editor is blocked from financial transactions (HTTP 403 Forbidden)"
    );

    // ------------------------------------------------------------------------
    // TEST 4: Scoped Dashboard & Publications Access
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 4: SCOPED DASHBOARD & 2-NEWSPAPER RESTRICTION ---");

    // Editor views dashboard stats -> receives content counts, but financial & enquiries are hidden
    const editorStatsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/dashboard/stats",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(editorStatsRes.statusCode === 200, "Editor can view dashboard stats (HTTP 200)");
    const editorStats = JSON.parse(editorStatsRes.body).data;
    assert(editorStats.publicationsCount === 2, "Dashboard reports strictly 2 newspapers");
    assert(
      editorStats.financial === null,
      "Financial and revenue figures are strictly NULL / hidden from Editor"
    );
    assert(
      editorStats.enquiries === null,
      "Enquiries metrics are restricted / NULL for Editor role"
    );

    // Admin views dashboard stats -> receives content, enquiries AND financial figures
    const adminStatsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/dashboard/stats",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(adminStatsRes.statusCode === 200, "Admin can view dashboard stats (HTTP 200)");
    const adminStats = JSON.parse(adminStatsRes.body).data;
    assert(adminStats.financial !== null, "Admin receives financial summary metrics");
    assert(typeof adminStats.financial.totalRevenueInr === "number", "Admin financial metrics include totalRevenueInr");
    assert(adminStats.enquiries !== null, "Admin receives enquiries metrics");

    // List publications -> strictly the TWO permitted newspaper publications
    const pubListRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/publications",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(pubListRes.statusCode === 200, "Admin publications list returns HTTP 200");
    const pubList = JSON.parse(pubListRes.body).data;
    const pubIds = pubList.map((p: any) => p.id);
    assert(
      pubList.length === 2 &&
        pubIds.includes("pub-janmabhoomi") &&
        pubIds.includes("pub-pravasi"),
      "Publications list contains ONLY pub-janmabhoomi and pub-pravasi (Purti is not a publication)"
    );

    // Excluded publications MUST be blocked (including pub-purti!)
    const purtiRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/publications/pub-purti",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(
      purtiRes.statusCode === 403,
      "Purti is not a standalone publication; request for 'pub-purti' is rejected with HTTP 403 Forbidden"
    );

    const kutchmitraRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/publications/pub-kutchmitra",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(
      kutchmitraRes.statusCode === 403,
      "Excluded publication 'pub-kutchmitra' is rejected with HTTP 403 Forbidden"
    );

    const phulchhabRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/publications/pub-phulchhab",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(
      phulchhabRes.statusCode === 403,
      "Excluded publication 'pub-phulchhab' is rejected with HTTP 403 Forbidden"
    );

    // Permitted publication details: Janmabhoomi
    const jbRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/publications/pub-janmabhoomi",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(jbRes.statusCode === 200, "Permitted newspaper 'pub-janmabhoomi' returns HTTP 200");
    const jbData = JSON.parse(jbRes.body).data;
    assert(jbData.publicationType === "DAILY_NEWSPAPER", "Janmabhoomi publicationType is DAILY_NEWSPAPER");
    assert(jbData.status === "ACTIVE", "Janmabhoomi status is ACTIVE");

    // Permitted publication details: Janmabhoomi Pravasi
    const pravasiRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/publications/pub-pravasi",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(pravasiRes.statusCode === 200, "Permitted newspaper 'pub-pravasi' returns HTTP 200");
    const pravasiData = JSON.parse(pravasiRes.body).data;
    assert(pravasiData.publicationType === "WEEKLY_NEWSPAPER", "Janmabhoomi Pravasi publicationType is WEEKLY_NEWSPAPER");
    assert(pravasiData.status === "PLANNED", "Janmabhoomi Pravasi status PLANNED is preserved");

    // ------------------------------------------------------------------------
    // TEST 5: Staff Status & Session Revocation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 5: STAFF LIFECYCLE & SESSION REVOCATION ---");

    // Deactivate test editor
    const deactivateRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/staff/${testEditorId}/status`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { status: "DEACTIVATED" },
    });
    assert(deactivateRes.statusCode === 200, "Admin can deactivate staff account (HTTP 200)");

    // Deactivated user login attempt -> 403
    const deactivatedLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: "editor.test@janmabhoomi.in",
        password: "EditorSecurePassword2026!",
      },
    });
    assert(deactivatedLoginRes.statusCode === 403, "Deactivated staff login rejected with HTTP 403");

    // Deactivated user previous session should be rejected
    const revokedSessionRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/dashboard/stats",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(revokedSessionRes.statusCode === 401, "Revoked session rejected with HTTP 401 Unauthorized");

    // Reactivate test editor
    await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/staff/${testEditorId}/status`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { status: "ACTIVE" },
    });

    // Re-authenticate editor to get fresh active session
    const editorReloginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: "editor.test@janmabhoomi.in",
        password: "EditorSecurePassword2026!",
      },
    });
    assert(editorReloginRes.statusCode === 200, "Reactivated editor re-login returns HTTP 200");
    editorToken = JSON.parse(editorReloginRes.body).data.token;

    // ------------------------------------------------------------------------
    // TEST 6: All 7 Excluded Publications Strict Isolation
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 6: ALL 7 EXCLUDED PUBLICATIONS ISOLATION ---");

    const ALL_EXCLUDED_PUBLICATIONS = [
      "pub-kutchmitra",
      "pub-phulchhab",
      "pub-vyapar-gu",
      "pub-vyapar-hi",
      "pub-panchang",
      "pub-kavita",
      "pub-purti",
    ];

    for (const pubId of ALL_EXCLUDED_PUBLICATIONS) {
      // 1. Publication Detail Endpoint must return HTTP 403
      const pubDetailRes = await app.inject({
        method: "GET",
        url: `/api/v1/admin/publications/${pubId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      assert(
        pubDetailRes.statusCode === 403,
        `GET /api/v1/admin/publications/${pubId} rejected with HTTP 403 Forbidden`
      );

      // 2. E-paper Edition Creation for Excluded Publication must return HTTP 403
      const epaperCreateRes = await app.inject({
        method: "POST",
        url: "/api/v1/epaper/admin/editions",
        headers: { authorization: `Bearer ${adminToken}` },
        payload: {
          publicationId: pubId,
          editionDate: "2026-11-12",
          editionCity: "Mumbai",
          editionNameEn: "Excluded Edition",
          editionNameGu: "બાકાત આવૃત્તિ",
        },
      });
      assert(
        epaperCreateRes.statusCode === 403,
        `POST /api/v1/epaper/admin/editions for excluded '${pubId}' rejected with HTTP 403`
      );

      // 3. E-paper Editions Query for Excluded Publication must return HTTP 403
      const epaperListRes = await app.inject({
        method: "GET",
        url: `/api/v1/epaper/admin/editions?publicationId=${pubId}`,
        headers: { authorization: `Bearer ${adminToken}` },
      });
      assert(
        epaperListRes.statusCode === 403,
        `GET /api/v1/epaper/admin/editions?publicationId=${pubId} rejected with HTTP 403`
      );
    }

    // Permitted publication queries must succeed
    const permittedJbList = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions?publicationId=pub-janmabhoomi",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(permittedJbList.statusCode === 200, "Query for 'pub-janmabhoomi' allowed (HTTP 200)");

    const permittedPravasiList = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions?publicationId=pub-pravasi",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(permittedPravasiList.statusCode === 200, "Query for 'pub-pravasi' allowed (HTTP 200)");

    // ------------------------------------------------------------------------
    // TEST 7: E-Paper Granular Operation Authorization & Least-Privilege
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 7: E-PAPER GRANULAR OPERATION AUTHORIZATION ---");

    // 1. Editor View editions list
    const editorEditionsRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(editorEditionsRes.statusCode === 200, "Editor can view E-paper editions list (HTTP 200)");

    // 2. Editor Create edition for permitted publication
    const editorCreateEditionRes = await app.inject({
      method: "POST",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${editorToken}` },
      payload: {
        publicationId: "pub-janmabhoomi",
        editionDate: "2026-11-12",
        editionCity: "Mumbai",
        editionNameEn: "Evening Audit Test",
        editionNameGu: "સાંધ્ય ઓડિટ ટેસ્ટ",
      },
    });
    assert(editorCreateEditionRes.statusCode === 201, "Editor can create draft edition (HTTP 201)");
    const createdEdition = JSON.parse(editorCreateEditionRes.body).edition;
    const testEditionId = createdEdition.id;

    // 3. Create test page on this edition for hotspot and article linking verification
    const testPage = await app.prisma.ePaperPage.create({
      data: {
        editionId: testEditionId,
        pageNumber: 1,
        labelEn: "Page 1",
        labelGu: "પાનું ૧",
        widthPx: 1200,
        heightPx: 1800,
        imageHighresKey: "editions/test/page_1.png",
        imageThumbnailKey: "editions/test/thumb_1.png",
      },
    });

    // Editor View hotspot editor data
    const editorHotspotDataRes = await app.inject({
      method: "GET",
      url: `/api/v1/epaper/admin/editions/${testEditionId}/editor`,
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(editorHotspotDataRes.statusCode === 200, "Editor can view page hotspot editor data (HTTP 200)");

    // 4. Editor creates hotspot linked to valid Janmabhoomi article
    const jbArticle = await app.prisma.article.findFirst({
      where: { publicationId: "pub-janmabhoomi" },
    });
    const kmArticle = await app.prisma.article.findFirst({
      where: { publicationId: "pub-kutchmitra" },
    });

    const createHotspotRes = await app.inject({
      method: "POST",
      url: `/api/v1/epaper/admin/pages/${testPage.id}/hotspots`,
      headers: { authorization: `Bearer ${editorToken}` },
      payload: {
        xPercent: 10,
        yPercent: 10,
        widthPercent: 20,
        heightPercent: 20,
        headlineText: "Lead Article Link Test",
        articleId: jbArticle ? jbArticle.id : undefined,
        targetType: "article",
      },
    });
    assert(createHotspotRes.statusCode === 201, "Editor can create hotspot linked to permitted article (HTTP 201)");
    const createdHotspot = JSON.parse(createHotspotRes.body).hotspot;

    // 5. Editor attempts to link hotspot to an article belonging to excluded publication -> MUST be rejected (HTTP 403)
    if (kmArticle) {
      const forbiddenLinkRes = await app.inject({
        method: "POST",
        url: `/api/v1/epaper/admin/pages/${testPage.id}/hotspots`,
        headers: { authorization: `Bearer ${editorToken}` },
        payload: {
          xPercent: 35,
          yPercent: 35,
          widthPercent: 20,
          heightPercent: 20,
          headlineText: "Excluded Article Link Test",
          articleId: kmArticle.id,
          targetType: "article",
        },
      });
      assert(
        forbiddenLinkRes.statusCode === 403,
        "Linking hotspot to an article from an excluded publication rejected with HTTP 403"
      );
    }

    // 6. Editor updates hotspot geometry
    const updateHotspotRes = await app.inject({
      method: "PUT",
      url: `/api/v1/epaper/admin/hotspots/${createdHotspot.id}`,
      headers: { authorization: `Bearer ${editorToken}` },
      payload: {
        xPercent: 12,
        yPercent: 12,
        widthPercent: 22,
        heightPercent: 22,
        headlineText: "Updated Headline Test",
      },
    });
    assert(updateHotspotRes.statusCode === 200, "Editor can update hotspot geometry (HTTP 200)");

    // 7. Editor deletes hotspot
    const deleteHotspotRes = await app.inject({
      method: "DELETE",
      url: `/api/v1/epaper/admin/hotspots/${createdHotspot.id}`,
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(deleteHotspotRes.statusCode === 200, "Editor can delete hotspot (HTTP 200)");

    // 8. Editor Publish edition (Editorial Desk authority)
    const editorPublishRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/epaper/admin/editions/${testEditionId}/status`,
      headers: { authorization: `Bearer ${editorToken}` },
      payload: { status: "PUBLISHED" },
    });
    assert(editorPublishRes.statusCode === 200, "Editor can publish edition (HTTP 200)");

    // 9. Editor attempts to ARCHIVE edition -> MUST be blocked (Admin only)
    const editorArchiveAttemptRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/epaper/admin/editions/${testEditionId}/status`,
      headers: { authorization: `Bearer ${editorToken}` },
      payload: { status: "ARCHIVED" },
    });
    assert(
      editorArchiveAttemptRes.statusCode === 403,
      "Editor is blocked from archiving editions (HTTP 403 ADMIN_ROLE_REQUIRED)"
    );

    // 10. Editor attempts to DELETE edition -> MUST be blocked (Admin only)
    const editorDeleteAttemptRes = await app.inject({
      method: "DELETE",
      url: `/api/v1/epaper/admin/editions/${testEditionId}`,
      headers: { authorization: `Bearer ${editorToken}` },
    });
    assert(
      editorDeleteAttemptRes.statusCode === 403,
      "Editor is blocked from deleting editions (HTTP 403 ADMIN_ROLE_REQUIRED)"
    );

    // 11. Admin archives edition -> Permitted
    const adminArchiveRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/epaper/admin/editions/${testEditionId}/status`,
      headers: { authorization: `Bearer ${adminToken}` },
      payload: { status: "ARCHIVED" },
    });
    assert(adminArchiveRes.statusCode === 200, "Admin can archive edition (HTTP 200)");

    // 12. Admin deletes edition -> Permitted
    const adminDeleteRes = await app.inject({
      method: "DELETE",
      url: `/api/v1/epaper/admin/editions/${testEditionId}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(adminDeleteRes.statusCode === 200, "Admin can permanently delete edition (HTTP 200)");

    // ------------------------------------------------------------------------
    // TEST 8: Payment & Support Role Granular Access & Data Privacy
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 8: PAYMENT & SUPPORT ROLE ACCESS & DATA PRIVACY ---");

    // Clean up test support user if existed
    await app.prisma.user.deleteMany({
      where: { email: "support.test@janmabhoomi.in" },
    });

    // Create a support staff user
    const supportPasswordHash = await hashPassword("SupportTestPassword2026!");
    const supportUser = await app.prisma.user.create({
      data: {
        email: "support.test@janmabhoomi.in",
        fullName: "Customer Support Desk",
        passwordHash: supportPasswordHash,
        isStaff: true,
        status: "ACTIVE",
      },
    });

    await app.prisma.userRole.create({
      data: {
        userId: supportUser.id,
        roleId: "support",
      },
    });

    // 1. Support staff login attempt via Admin Panel login -> MUST be rejected (Admin Panel is Admin/Editor only)
    const supportLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: {
        email: "support.test@janmabhoomi.in",
        password: "SupportTestPassword2026!",
      },
    });
    assert(
      supportLoginRes.statusCode === 403,
      "Support staff is barred from Admin Panel login interface (HTTP 403 FORBIDDEN_STAFF_ROLE)"
    );

    // 2. Establish valid staff session for support user to test backend payment endpoints directly
    const rawSupportToken = "test_support_bearer_token_123456789";
    const supportTokenHash = crypto.createHash("sha256").update(rawSupportToken).digest("hex");
    await app.prisma.staffSession.create({
      data: {
        userId: supportUser.id,
        tokenHash: supportTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const supportToken = rawSupportToken;

    // 3. Support has NO E-paper management access
    const supportEpaperRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${supportToken}` },
    });
    assert(
      supportEpaperRes.statusCode === 403,
      "Support role has NO E-paper management access (HTTP 403 FORBIDDEN_ROLE)"
    );

    const supportEpaperCreateRes = await app.inject({
      method: "POST",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${supportToken}` },
      payload: {
        publicationId: "pub-janmabhoomi",
        editionDate: "2026-11-12",
        editionCity: "Mumbai",
        editionNameEn: "Support Epaper Attempt",
        editionNameGu: "સપોર્ટ આવૃત્તિ",
      },
    });
    assert(
      supportEpaperCreateRes.statusCode === 403,
      "Support role cannot create E-paper editions (HTTP 403 FORBIDDEN_ROLE)"
    );

    // 4. Support can read transactions list for customer inquiry triage
    const supportTxRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/payments/transactions",
      headers: { authorization: `Bearer ${supportToken}` },
    });
    assert(
      supportTxRes.statusCode === 200,
      "Support staff has read-only access to transactions list for triage (HTTP 200)"
    );

    // 5. Support transaction detail inspection & privacy check
    const existingTx = await app.prisma.paymentTransaction.findFirst();
    if (existingTx) {
      const txDetailRes = await app.inject({
        method: "GET",
        url: `/api/v1/admin/payments/transactions/${existingTx.id}`,
        headers: { authorization: `Bearer ${supportToken}` },
      });
      assert(txDetailRes.statusCode === 200, "Support can view transaction details for triage (HTTP 200)");
      const txData = JSON.parse(txDetailRes.body).transaction;
      assert(
        txData.subscriber.passwordHash === undefined,
        "Subscriber passwordHash is strictly excluded from response (Credentials protected)"
      );
      assert(
        txData.razorpaySignature === undefined,
        "razorpaySignature is strictly excluded from response (Secrets protected)"
      );
      assert(
        txData.rawWebhookPayload === undefined,
        "rawWebhookPayload is strictly excluded from response (Payloads protected)"
      );
      assert(typeof txData.subscriber.email === "string", "Subscriber email is available for support triage");
    }

    // 6. Support attempts financial adjustment -> MUST be blocked (Super Admin required)
    const supportAdjustRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/payments/transactions/dummy-tx-id/adjust",
      headers: { authorization: `Bearer ${supportToken}` },
      payload: {
        status: "REFUNDED",
        reason: "Unauthorized adjustment attempt by support staff test",
      },
    });
    assert(
      supportAdjustRes.statusCode === 403,
      "Support staff is strictly forbidden from financial adjustments (HTTP 403 SUPER_ADMIN_REQUIRED)"
    );

    // Clean up test support user
    await app.prisma.user.deleteMany({
      where: { email: "support.test@janmabhoomi.in" },
    });

    // ------------------------------------------------------------------------
    // TEST 9: Direct API Access by Legacy Roles & Invalid Sessions
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 9: DIRECT API ACCESS BY LEGACY ROLES & INVALID SESSIONS ---");

    // 1. Reporter credentials test
    await app.prisma.user.deleteMany({
      where: { email: "reporter.test@janmabhoomi.in" },
    });

    const reporterHash = await hashPassword("ReporterSecret2026!");
    const reporterUser = await app.prisma.user.create({
      data: {
        email: "reporter.test@janmabhoomi.in",
        fullName: "Field Reporter",
        passwordHash: reporterHash,
        isStaff: true,
        status: "ACTIVE",
      },
    });

    await app.prisma.userRole.create({
      data: {
        userId: reporterUser.id,
        roleId: "reporter",
      },
    });

    const rawReporterToken = "test_reporter_bearer_token_999";
    const reporterTokenHash = crypto.createHash("sha256").update(rawReporterToken).digest("hex");
    await app.prisma.staffSession.create({
      data: {
        userId: reporterUser.id,
        tokenHash: reporterTokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    const reporterToken = rawReporterToken;

    // Reporter attempts E-paper list -> 403
    const repEpaperList = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${reporterToken}` },
    });
    assert(
      repEpaperList.statusCode === 403,
      "Reporter role has NO E-paper management access (HTTP 403 FORBIDDEN_ROLE)"
    );

    // Reporter attempts E-paper create -> 403
    const repEpaperCreate = await app.inject({
      method: "POST",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${reporterToken}` },
      payload: {
        publicationId: "pub-janmabhoomi",
        editionDate: "2026-11-12",
        editionCity: "Mumbai",
        editionNameEn: "Reporter Attempt",
        editionNameGu: "રિપોર્ટર પ્રયાસ",
      },
    });
    assert(
      repEpaperCreate.statusCode === 403,
      "Reporter cannot create E-paper editions (HTTP 403 FORBIDDEN_ROLE)"
    );

    // Reporter attempts payment access -> 403
    const repPaymentRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/payments/transactions",
      headers: { authorization: `Bearer ${reporterToken}` },
    });
    assert(
      repPaymentRes.statusCode === 403,
      "Reporter is blocked from payment transactions (HTTP 403 ADMIN_ROLE_REQUIRED)"
    );

    // Clean up reporter
    await app.prisma.user.deleteMany({
      where: { email: "reporter.test@janmabhoomi.in" },
    });

    // 2. Expired staff session test
    const rawExpiredToken = "expired_staff_session_token_111";
    const expiredTokenHash = crypto.createHash("sha256").update(rawExpiredToken).digest("hex");
    await app.prisma.staffSession.create({
      data: {
        userId: testEditorId,
        tokenHash: expiredTokenHash,
        expiresAt: new Date(Date.now() - 3600000), // expired 1 hour ago
      },
    });

    const expiredEpaperRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: `Bearer ${rawExpiredToken}` },
    });
    assert(
      expiredEpaperRes.statusCode === 401,
      "Expired staff session rejected with HTTP 401 (INVALID_STAFF_SESSION)"
    );

    // 3. Fabricated / Invalid token test
    const invalidTokenRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions",
      headers: { authorization: "Bearer completely_fake_and_unregistered_token" },
    });
    assert(
      invalidTokenRes.statusCode === 401,
      "Non-existent staff token rejected with HTTP 401 (INVALID_STAFF_SESSION)"
    );

    // 4. Missing Authorization header test
    const missingAuthRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/admin/editions",
    });
    assert(
      missingAuthRes.statusCode === 401,
      "Missing staff authorization header rejected with HTTP 401 (STAFF_AUTH_REQUIRED)"
    );

    // ------------------------------------------------------------------------
    // TEST 10: Staff Login Rate Limiting Audit
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 10: STAFF LOGIN RATE LIMITING AUDIT ---");

    const testSimulatedIp = "192.168.10.99";
    let lockoutOccurred = false;

    // Attempt 5 failed logins with bad password
    for (let i = 1; i <= 5; i++) {
      const failRes = await app.inject({
        method: "POST",
        url: "/api/v1/admin/auth/login",
        remoteAddress: testSimulatedIp,
        payload: {
          email: "admin@janmabhoomi.in",
          password: "DefinitivelyWrongPassword!",
        },
      });
      assert(failRes.statusCode === 401, `Failed attempt ${i}/5 returns HTTP 401`);
    }

    // 6th attempt from the same IP must be rejected with HTTP 429 RATE_LIMITED
    const lockedRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      remoteAddress: testSimulatedIp,
      payload: {
        email: "admin@janmabhoomi.in",
        password: "DefinitivelyWrongPassword!",
      },
    });
    assert(
      lockedRes.statusCode === 429,
      "6th failed login attempt triggers HTTP 429 Rate Limited (15-min lockout)"
    );
    const lockedData = JSON.parse(lockedRes.body);
    assert(lockedData.error.code === "RATE_LIMITED", "Error code is RATE_LIMITED");

    // Valid login from another IP works cleanly and resets attempt count on success
    const cleanIp = "192.168.10.100";
    const cleanLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      remoteAddress: cleanIp,
      payload: {
        email: "admin@janmabhoomi.in",
        password: "AdminSuperSecret@2026!",
      },
    });
    assert(cleanLoginRes.statusCode === 200, "Login from clean IP succeeds (HTTP 200) and resets tracker");

    // ------------------------------------------------------------------------
    // FINAL CLEANUP & SESSION LOGOUT
    // ------------------------------------------------------------------------
    console.log("\n--- FINAL CLEANUP & LOGOUT ---");

    // Logout admin session
    const logoutRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/logout",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(logoutRes.statusCode === 200, "Admin logout returns HTTP 200");

    // Old token should now be invalid
    const postLogoutRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/auth/me",
      headers: { authorization: `Bearer ${adminToken}` },
    });
    assert(postLogoutRes.statusCode === 401, "Logged-out token immediately rejected with HTTP 401");

    // Clean up test editor
    await app.prisma.user.deleteMany({
      where: { email: "editor.test@janmabhoomi.in" },
    });
  } catch (err) {
    console.error("Test execution error:", err);
    failed++;
  } finally {
    await app.close();
  }

  console.log("\n==================================================================");
  console.log(`  PHASE 5A ADMIN TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5ATests();
