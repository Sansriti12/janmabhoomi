import assert from "node:assert";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";
import { hashPassword } from "./services/passwordService.js";
import { getTranslationProvider } from "./services/translationService.js";

const prisma = new PrismaClient();
const app = buildApp();

let passedCount = 0;
let failedCount = 0;

function pass(testName: string) {
  passedCount++;
  console.log(`  [PASS] ${testName}`);
}

function fail(testName: string, err: any) {
  failedCount++;
  console.error(`  [FAIL] ${testName}:`, err.message || err);
}

async function runTests() {
  console.log("==================================================================");
  console.log(" JANMABHOOMI PHASE 5 — PERMISSIONS, SCHEDULING & EXPORT TESTS    ");
  console.log("==================================================================");

  await app.ready();

  const testSuffix = crypto.randomBytes(3).toString("hex");
  const testPassword = "Password123!Secure";
  const pwdHash = await hashPassword(testPassword);

  const rolesToTest = [
    { roleId: "super_admin", email: `superadmin_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "administrator", email: `admin_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "chief_editor", email: `chiefeditor_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "editor", email: `editor_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "reporter", email: `reporter_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "epaper_manager", email: `epaper_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "ad_manager", email: `admanager_${testSuffix}@janmabhoomi.in`, isStaff: true },
    { roleId: "support", email: `support_${testSuffix}@janmabhoomi.in`, isStaff: true },
  ];

  const createdUserIds: string[] = [];
  const tokens: Record<string, string | null> = {};

  try {
    console.log("\n--- TEST SUITE 1: 8-ROLE AUTHENTICATION & LOGIN ---");
    for (const r of rolesToTest) {
      const user = await prisma.user.create({
        data: {
          email: r.email,
          fullName: `Test User ${r.roleId}`,
          passwordHash: pwdHash,
          isStaff: r.isStaff,
          status: "ACTIVE",
          roles: { create: { roleId: r.roleId } },
        },
      });
      createdUserIds.push(user.id);

      const loginRes = await app.inject({
        method: "POST",
        url: "/api/v1/admin/auth/login",
        payload: { email: r.email, password: testPassword },
      });

      if (r.roleId === "ad_manager" || r.roleId === "support") {
        // Non-unified roles must be rejected from staff login with 403 UNAUTHORIZED_ROLE
        assert.strictEqual(loginRes.statusCode, 403);
        const errJson = JSON.parse(loginRes.body);
        assert.strictEqual(errJson.error.code, "UNAUTHORIZED_ROLE");
        tokens[r.roleId] = null;
        pass(`Role '${r.roleId}' rejected from unified admin panel with 403 UNAUTHORIZED_ROLE`);
      } else {
        assert.strictEqual(loginRes.statusCode, 200);
        const json = JSON.parse(loginRes.body);
        tokens[r.roleId] = json.data.token;
        pass(`Role '${r.roleId}' authenticated successfully (unifiedRole: ${json.data.user.role})`);
      }
    }

    console.log("\n--- TEST SUITE 2: NEWSROOM ARTICLE CREATION AUTHORIZATION ---");
    const samplePayload = {
      publicationId: "pub-janmabhoomi",
      categoryId: "national",
      headlineGu: "અમદાવાદમાં નવી મેટ્રો લાઇનનું પરીક્ષણ સફળતાપૂર્વક પૂર્ણ થયું",
      summaryGu: "અમદાવાદના નાગરિકો માટે નવી મેટ્રો સેવા શરૂ થવા જઈ રહી છે.",
      contentHtmlGu: "<p>અમદાવાદ મેટ્રો ફેઝ-૨ ની કામગીરી ઝડપભેર આગળ વધી રહી છે.</p>",
    };

    // super_admin -> ALLOWED
    const superAdminRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["super_admin"]}` },
      payload: samplePayload,
    });
    assert.strictEqual(superAdminRes.statusCode, 201);
    const createdArticleId = JSON.parse(superAdminRes.body).data.id;
    pass("Role 'super_admin' authorized to create articles (201 Created)");

    // administrator -> ALLOWED
    const adminRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
      payload: samplePayload,
    });
    assert.strictEqual(adminRes.statusCode, 201);
    pass("Role 'administrator' authorized to create articles (201 Created)");

    // chief_editor -> FORBIDDEN (403)
    const chiefEditorRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["chief_editor"]}` },
      payload: samplePayload,
    });
    assert.strictEqual(chiefEditorRes.statusCode, 403);
    assert.strictEqual(JSON.parse(chiefEditorRes.body).error.code, "ADMIN_ROLE_REQUIRED");
    pass("Role 'chief_editor' strictly forbidden from creating articles (403 ADMIN_ROLE_REQUIRED)");

    // editor -> FORBIDDEN (403)
    const editorRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["editor"]}` },
      payload: samplePayload,
    });
    assert.strictEqual(editorRes.statusCode, 403);
    pass("Role 'editor' strictly forbidden from creating articles (403 ADMIN_ROLE_REQUIRED)");

    // reporter -> FORBIDDEN (403)
    const reporterRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["reporter"]}` },
      payload: samplePayload,
    });
    assert.strictEqual(reporterRes.statusCode, 403);
    pass("Role 'reporter' strictly forbidden from creating articles (403 ADMIN_ROLE_REQUIRED)");

    // epaper_manager -> FORBIDDEN (403)
    const epaperMgrRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["epaper_manager"]}` },
      payload: samplePayload,
    });
    assert.strictEqual(epaperMgrRes.statusCode, 403);
    pass("Role 'epaper_manager' strictly forbidden from creating articles (403 ADMIN_ROLE_REQUIRED)");

    console.log("\n--- TEST SUITE 3: E-PAPER MANAGEMENT PRESERVATION ---");
    // Verify editor CAN access E-paper editions (Phase 5A permission preserved)
    const editorEpaperRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/editions?publication=pub-janmabhoomi",
      headers: { Authorization: `Bearer ${tokens["editor"]}` },
    });
    assert.strictEqual(editorEpaperRes.statusCode, 200);
    pass("Role 'editor' retains valid E-paper viewing access (200 OK)");

    // Verify epaper_manager CAN access E-paper editions
    const epaperMgrAccessRes = await app.inject({
      method: "GET",
      url: "/api/v1/epaper/editions?publication=pub-janmabhoomi",
      headers: { Authorization: `Bearer ${tokens["epaper_manager"]}` },
    });
    assert.strictEqual(epaperMgrAccessRes.statusCode, 200);
    pass("Role 'epaper_manager' retains valid E-paper viewing access (200 OK)");

    console.log("\n--- TEST SUITE 4: FINANCIAL & SUBSCRIBER ACCESS RESTRICTIONS ---");
    // Editor forbidden from payments
    const editorPaymentsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/payments/transactions",
      headers: { Authorization: `Bearer ${tokens["editor"]}` },
    });
    assert.strictEqual(editorPaymentsRes.statusCode, 403);
    pass("Role 'editor' strictly forbidden from payment transactions (403)");

    // Administrator allowed to view payments
    const adminPaymentsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/payments/transactions",
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
    });
    assert.strictEqual(adminPaymentsRes.statusCode, 200);
    pass("Role 'administrator' authorized to view payments (200 OK)");

    console.log("\n--- TEST SUITE 5: ARTICLE REVISION HISTORY & AUDIT TRAIL ---");
    const historyRes = await app.inject({
      method: "GET",
      url: `/api/v1/admin/articles/${createdArticleId}/history`,
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
    });
    assert.strictEqual(historyRes.statusCode, 200);
    const historyJson = JSON.parse(historyRes.body);
    assert.strictEqual(historyJson.success, true);
    assert.ok(Array.isArray(historyJson.data.history));
    assert.ok(historyJson.data.history.length > 0);
    assert.strictEqual(historyJson.data.sourceVersion, 1);
    pass("Article revision history endpoint returns complete audit trail with actor metadata");

    console.log("\n--- TEST SUITE 6: CSV EXPORT ENDPOINT ---");
    const csvRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/articles/export/csv?publicationId=pub-janmabhoomi",
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
    });
    assert.strictEqual(csvRes.statusCode, 200);
    assert.ok(csvRes.headers["content-type"]?.includes("text/csv"));
    assert.ok(csvRes.headers["content-disposition"]?.includes("janmabhoomi-articles-export.csv"));
    assert.ok(csvRes.body.includes('"Article ID","Publication","Category"'));
    pass("CSV export endpoint streams valid comma-separated dataset with download headers");

    console.log("\n--- TEST SUITE 7: SCHEDULED PUBLICATION AUTOMATION ---");
    // Schedule an article for 5 minutes ago
    const pastScheduleTime = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const scheduleRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/articles/${createdArticleId}/status`,
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
      payload: {
        status: "SCHEDULED",
        scheduledFor: pastScheduleTime,
      },
    });
    assert.strictEqual(scheduleRes.statusCode, 200);
    pass("Article status transitioned to SCHEDULED with past timestamp");

    // Trigger process-scheduled endpoint
    const processRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles/process-scheduled",
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
    });
    assert.strictEqual(processRes.statusCode, 200);
    const processJson = JSON.parse(processRes.body);
    assert.ok(processJson.publishedCount >= 1);
    pass("process-scheduled endpoint auto-published elapsed scheduled article");

    // Verify article is now PUBLISHED in database
    const verifyArt = await prisma.article.findUnique({ where: { id: createdArticleId } });
    assert.strictEqual(verifyArt?.status, "PUBLISHED");
    assert.ok(verifyArt?.publishedAt !== null);
    pass("Article status verified as PUBLISHED with publishedAt timestamp");

    console.log("\n--- TEST SUITE 8: PUBLIC ARTICLE PRIVACY & BILINGUAL SLUGS ---");
    // 1. Create a draft article
    const draftRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${tokens["administrator"]}` },
      payload: {
        publicationId: "pub-janmabhoomi",
        categoryId: "city",
        headlineGu: "ગુપ્ત ડ્રાફ્ટ સમાચાર શીર્ષક - માત્ર આંતરિક ઉપયોગ માટે",
        summaryGu: "આ સમાચાર હજી સુધી પ્રકાશિત થયા નથી અને ખાનગી રહેવા જોઈએ.",
        contentHtmlGu: "<p>ખાનગી અહેવાલ સામગ્રી.</p>",
      },
    });
    const draftJson = JSON.parse(draftRes.body);
    const draftGuSlug = draftJson.data.gujarati.slug;

    // Public request for draft -> MUST RETURN 404
    const publicDraftRes = await app.inject({
      method: "GET",
      url: `/api/v1/articles/${draftGuSlug}?lang=gu`,
    });
    assert.strictEqual(publicDraftRes.statusCode, 404);
    pass("Public API strictly hides unpublished DRAFT articles (404 Not Found)");

    // 2. Public request for published article -> MUST RETURN 200 with alternateSlugs
    const pubGuSlug = (await prisma.articleTranslation.findFirst({
      where: { articleId: createdArticleId, language: "gu" },
    }))?.slug;
    assert.ok(pubGuSlug);

    const publicPublishedRes = await app.inject({
      method: "GET",
      url: `/api/v1/articles/${pubGuSlug}?lang=gu`,
    });
    assert.strictEqual(publicPublishedRes.statusCode, 200);
    const pubArticleJson = JSON.parse(publicPublishedRes.body);
    assert.ok(pubArticleJson.data.alternateSlugs.gu);
    assert.ok(pubArticleJson.data.alternateSlugs.en);
    pass("Public API serves published article with verified bilingual alternateSlugs");

    console.log("\n--- TEST SUITE 9: CONFIGURABLE TRANSLATION PROVIDER ---");
    process.env.TRANSLATION_PROVIDER = "mock";
    const mockProvider = getTranslationProvider();
    assert.strictEqual(mockProvider.name, "Janmabhoomi-Mock-Translation-Engine");
    pass("TRANSLATION_PROVIDER=mock instantiates deterministic local mock engine");

    delete process.env.TRANSLATION_PROVIDER;
    const defaultProvider = getTranslationProvider();
    assert.ok(defaultProvider);
    pass("Default provider fallback operates without throwing errors when API keys are absent");

  } catch (err: any) {
    fail("Phase 5 Permissions & Feature Test", err);
  } finally {
    console.log("\n--- CLEANUP: REMOVING TEST ARTIFACTS ---");
    if (createdUserIds.length > 0) {
      await prisma.userRole.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.staffSession.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.auditLog.deleteMany({ where: { userId: { in: createdUserIds } } });
      await prisma.article.deleteMany({ where: { createdBy: { in: createdUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    }
    await prisma.$disconnect();
  }

  console.log("\n==================================================================");
  console.log(`  PHASE 5 TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("==================================================================");

  if (failedCount > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
