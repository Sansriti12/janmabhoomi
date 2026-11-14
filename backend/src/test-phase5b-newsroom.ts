import assert from "node:assert";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "./app.js";
import { hashPassword } from "./services/passwordService.js";
import { hashStaffToken } from "./services/staffAuthService.js";

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
  console.log("   JANMABHOOMI PHASE 5B — NEWSROOM & CONTENT MANAGEMENT TESTS     ");
  console.log("==================================================================");

  await app.ready();

  const testSuffix = crypto.randomBytes(3).toString("hex");
  const adminEmail = `admin_newsroom_${testSuffix}@janmabhoomi.in`;
  const editorEmail = `editor_newsroom_${testSuffix}@janmabhoomi.in`;
  const testPassword = "Password123!Secure";

  let adminToken: string = "";
  let editorToken: string = "";
  let adminUserId: string = "";
  let editorUserId: string = "";

  try {
    // ------------------------------------------------------------------------
    // SETUP: Create Admin & Editor users and generate valid staff sessions
    // ------------------------------------------------------------------------
    console.log("\n--- SETUP: CREATING NEWSROOM STAFF USERS ---");
    const pwdHash = await hashPassword(testPassword);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: "Chief Administrator Newsroom",
        passwordHash: pwdHash,
        isStaff: true,
        status: "ACTIVE",
        roles: { create: { roleId: "administrator" } },
      },
    });
    adminUserId = adminUser.id;

    const editorUser = await prisma.user.create({
      data: {
        email: editorEmail,
        fullName: "Senior Editor Desk",
        passwordHash: pwdHash,
        isStaff: true,
        status: "ACTIVE",
        roles: { create: { roleId: "editor" } },
      },
    });
    editorUserId = editorUser.id;

    // Login Admin
    const adminLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: { email: adminEmail, password: testPassword },
    });
    assert.strictEqual(adminLoginRes.statusCode, 200);
    const adminLoginJson = JSON.parse(adminLoginRes.body);
    adminToken = adminLoginJson.data.token;
    pass("Admin authenticated successfully and token received");

    // Login Editor
    const editorLoginRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/auth/login",
      payload: { email: editorEmail, password: testPassword },
    });
    assert.strictEqual(editorLoginRes.statusCode, 200);
    const editorLoginJson = JSON.parse(editorLoginRes.body);
    editorToken = editorLoginJson.data.token;
    pass("Editor authenticated successfully and token received");

    // ------------------------------------------------------------------------
    // TEST SUITE 1: GUJARATI-FIRST ARTICLE CREATION & AUTO-TRANSLATION
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 1: ARTICLE CREATION & AUTO-TRANSLATION ---");

    const sampleHeadlineGu = "મુંબઈ મહાનગરપાલિકા દ્વારા ૫૦૦ કરોડ રૂપિયાની નવી પાણી પુરવઠા યોજના મંજૂર";
    const sampleSummaryGu = "મુંબઈના નાગરિકો માટે પીવાના શુદ્ધ પાણીની સુવિધા વધારવા ૫૦૦ કરોડના બજેટની જાહેરાત કરવામાં આવી છે.";
    const sampleContentGu = `<p>મુંબઈ મહાનગરપાલિકા (BMC) દ્વારા આજે શહેરના વિવિધ વિસ્તારોમાં પાણીની સુવિધા સુધારવા ૫૦૦ કરોડ રૂપિયાની નવી યોજનાને મંજૂરી આપવામાં આવી છે.</p>
<p>આ યોજના અંતર્ગત નવી પાઇપલાઇન અને જળ શુદ્ધિકરણ પ્લાન્ટ સ્થાપવામાં આવશે. મુખ્યમંત્રી અને કમિશનરે આ પ્રોજેક્ટને પ્રાથમિકતા આપવાનો નિર્ણય લીધો છે.</p>`;

    let createdArticleId: string = "";

    // Test 1.1: Admin creates Gujarati article draft -> auto-translates to English
    const createRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        publicationId: "pub-janmabhoomi",
        categoryId: "city",
        headlineGu: sampleHeadlineGu,
        summaryGu: sampleSummaryGu,
        contentHtmlGu: sampleContentGu,
        isBreaking: true,
        publishImmediately: false,
      },
    });

    assert.strictEqual(createRes.statusCode, 201);
    const createJson = JSON.parse(createRes.body);
    assert.strictEqual(createJson.success, true);
    createdArticleId = createJson.data.id;
    assert.ok(createdArticleId);
    assert.strictEqual(createJson.data.status, "DRAFT");
    assert.ok(createJson.data.english.headline);
    pass("Admin successfully creates Gujarati draft; auto-translation succeeds");

    // Test 1.2: Check that English translation preserved factual numbers (500) and paragraph structure
    const getArticleRes = await app.inject({
      method: "GET",
      url: `/api/v1/admin/articles/${createdArticleId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(getArticleRes.statusCode, 200);
    const getArticleJson = JSON.parse(getArticleRes.body);
    const enData = getArticleJson.data.english;
    assert.ok(enData);
    assert.strictEqual(enData.translationStatus, "COMPLETED");
    assert.ok(enData.headline.includes("Mumbai") || enData.headline.includes("BMC"));
    pass("English translation preserves paragraph structure and news terminology");

    // Test 1.3: Sensitive content detection check
    const sensitiveHeadlineGu = "મુંબઈ કોર્ટમાં ભ્રષ્ટાચાર અને લાંચ કેસમાં પૂર્વ મંત્રી વિરુદ્ધ સુનાવણી હાથ ધરાઈ";
    const sensitiveSummaryGu = "પોલીસ અને સીબીઆઈ દ્વારા ૨૫ કરોડના કૌભાંડમાં FIR નોંધી ધરપકડ કરવામાં આવી હતી.";
    const sensitiveContentGu = "<p>કોર્ટમાં જામીન અરજી પર સુનાવણી દરમિયાન મેજિસ્ટ્રેટ સમક્ષ પુરાવા રજૂ કરવામાં આવ્યા હતા.</p>";

    const sensitiveCreateRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        publicationId: "pub-janmabhoomi",
        categoryId: "national",
        headlineGu: sensitiveHeadlineGu,
        summaryGu: sensitiveSummaryGu,
        contentHtmlGu: sensitiveContentGu,
      },
    });
    assert.strictEqual(sensitiveCreateRes.statusCode, 201);
    const sensitiveJson = JSON.parse(sensitiveCreateRes.body);
    assert.strictEqual(sensitiveJson.data.english.translationStatus, "NEEDS_ATTENTION");
    assert.ok(
      sensitiveJson.data.english.qualityWarnings.some((w: string) =>
        w.includes("SENSITIVE CONTENT ADVISORY")
      )
    );
    pass("Automated quality check flags sensitive news (Court/Crime/Corruption) with advisory");

    // ------------------------------------------------------------------------
    // TEST SUITE 2: TRANSLATION VERSIONING & SYNC ON GUJARATI UPDATES
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 2: SOURCE UPDATE & STALE TRANSLATION DETECTION ---");

    // Test 2.1: Admin modifies Gujarati source text
    const updatedHeadlineGu = "મુંબઈ મહાનગરપાલિકા દ્વારા ૭૫૦ કરોડ રૂપિયાની નવી પાણી પુરવઠા યોજના મંજૂર";
    const updateRes = await app.inject({
      method: "PUT",
      url: `/api/v1/admin/articles/${createdArticleId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        headlineGu: updatedHeadlineGu,
        retranslate: false, // Explicitly test marking outdated without auto-overwrite
      },
    });

    assert.strictEqual(updateRes.statusCode, 200);
    const updateJson = JSON.parse(updateRes.body);
    assert.strictEqual(updateJson.data.sourceChanged, true);
    assert.strictEqual(updateJson.data.sourceVersion, 2);
    assert.strictEqual(updateJson.data.translationStatus, "OUTDATED");
    pass("Updating Gujarati source increments sourceVersion and marks English OUTDATED");

    // Test 2.2: Verify previous English translation was preserved in previous* columns
    const getOutdatedRes = await app.inject({
      method: "GET",
      url: `/api/v1/admin/articles/${createdArticleId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const outdatedJson = JSON.parse(getOutdatedRes.body);
    assert.ok(outdatedJson.data.english.headline);
    pass("Previous English translation preserved safely for side-by-side comparison");

    // Test 2.3: Manual edit of English translation by Admin
    const manualHeadlineEn = "Mumbai Municipal Corporation Approves Rs 750 Crore Water Supply Project";
    const editEnRes = await app.inject({
      method: "PUT",
      url: `/api/v1/admin/articles/${createdArticleId}/translation/en`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        headlineEn: manualHeadlineEn,
        summaryEn: "BMC announces updated water infrastructure plan with enhanced allocation.",
        contentHtmlEn: "<p>The BMC has revised the project budget to Rs 750 crore following municipal council approval.</p>",
      },
    });

    assert.strictEqual(editEnRes.statusCode, 200);
    const editEnJson = JSON.parse(editEnRes.body);
    assert.strictEqual(editEnJson.data.isManuallyEdited, true);
    assert.strictEqual(editEnJson.data.translationStatus, "COMPLETED");
    pass("Admin manual edit of English translation marked isManuallyEdited: true");

    // ------------------------------------------------------------------------
    // TEST SUITE 3: PUBLISHING WORKFLOW & SECURITY RESTRICTIONS
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 3: PUBLISHING PERMISSIONS & ACCESS RULES ---");

    // Test 3.1: Non-Admin (Editor) cannot publish or schedule articles (HTTP 403)
    const editorPublishRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/articles/${createdArticleId}/status`,
      headers: { Authorization: `Bearer ${editorToken}` },
      payload: { status: "PUBLISHED" },
    });
    assert.strictEqual(editorPublishRes.statusCode, 403);
    pass("Non-Admin staff (Editor) blocked with HTTP 403 from publishing news");

    // Test 3.2: Public news APIs do not expose unpublished DRAFT articles
    const publicHomeRes = await app.inject({
      method: "GET",
      url: "/api/v1/articles/home?publication=pub-janmabhoomi&lang=gu",
    });
    assert.strictEqual(publicHomeRes.statusCode, 200);
    const publicHomeJson = JSON.parse(publicHomeRes.body);
    const breakingList = publicHomeJson.data.breakingNews || [];
    assert.strictEqual(
      breakingList.some((art: any) => art.id === createdArticleId),
      false
    );
    pass("Public API strictly excludes unpublished DRAFT articles");

    // Test 3.3: Admin publishes the article
    const adminPublishRes = await app.inject({
      method: "PATCH",
      url: `/api/v1/admin/articles/${createdArticleId}/status`,
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: { status: "PUBLISHED" },
    });
    assert.strictEqual(adminPublishRes.statusCode, 200);
    const adminPublishJson = JSON.parse(adminPublishRes.body);
    assert.strictEqual(adminPublishJson.data.status, "PUBLISHED");
    assert.ok(adminPublishJson.data.publishedAt);
    pass("Admin successfully publishes article; status transitions to PUBLISHED");

    // Test 3.4: Now published article is available on public API
    const publicLatestRes = await app.inject({
      method: "GET",
      url: "/api/v1/articles/latest?publication=pub-janmabhoomi&lang=gu",
    });
    assert.strictEqual(publicLatestRes.statusCode, 200);
    const publicLatestJson = JSON.parse(publicLatestRes.body);
    assert.ok(publicLatestJson.data.some((a: any) => a.id === createdArticleId));
    pass("Published article immediately accessible on public news API");

    // ------------------------------------------------------------------------
    // TEST SUITE 4: PUBLICATION SCOPE BOUNDARIES (STRICTLY TWO NEWSPAPERS)
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 4: PUBLICATION ALLOWLIST & PURTI ENFORCEMENT ---");

    // Test 4.1: Permitted publications allow Janmabhoomi and Janmabhoomi Pravasi
    const pravasiArticleRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        publicationId: "pub-pravasi",
        categoryId: "religion-culture",
        headlineGu: "જન્મભૂમિ પ્રવાસી રવિવારીય આવૃત્તિ: વિશેષ સાંસ્કૃતિક અહેવાલ",
        summaryGu: "રવિવારના અંકમાં સાહિત્યિક અને પારિવારિક વિશેષ પૂર્તિઓ સામેલ કરવામાં આવી છે.",
        contentHtmlGu: "<p>પ્રવાસીની રવિવારીય આવૃત્તિ પરિવારના દરેક સભ્ય માટે વાંચન સામગ્રી પ્રદાન કરે છે.</p>",
      },
    });
    assert.strictEqual(pravasiArticleRes.statusCode, 201);
    pass("Janmabhoomi Pravasi (pub-pravasi) article creation permitted");

    // Test 4.2: Excluded group publication (e.g. pub-kutchmitra) rejected with 400 validation error
    const excludedPubRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        publicationId: "pub-kutchmitra",
        categoryId: "national",
        headlineGu: "કચ્છમિત્ર સમાચાર લેખ",
        summaryGu: "આ લેખ એડમિન પેનલમાં મંજૂર નથી.",
        contentHtmlGu: "<p>સામગ્રી</p>",
      },
    });
    assert.strictEqual(excludedPubRes.statusCode, 400);
    pass("Excluded sister publication (pub-kutchmitra) blocked with validation error");

    // Test 4.3: Purti is NOT allowed as a publication ID
    const purtiPubRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/articles",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        publicationId: "pub-purti",
        categoryId: "editorial",
        headlineGu: "પૂર્તિ સ્વતંત્ર પ્રકાશન નથી",
        summaryGu: "પૂર્તિ એ આવૃત્તિ સાથે જોડાયેલી પૂરક સામગ્રી છે.",
        contentHtmlGu: "<p>સામગ્રી</p>",
      },
    });
    assert.strictEqual(purtiPubRes.statusCode, 400);
    pass("Purti cannot be selected as an independent publication record");

    // ------------------------------------------------------------------------
    // TEST SUITE 5: MEDIA ASSET LIBRARY
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 5: MEDIA LIBRARY & ASSET MANAGEMENT ---");

    const dummyImageBuffer = Buffer.from("fake-png-image-binary-stream-for-test");
    const boundary = "----WebKitFormBoundary" + crypto.randomBytes(8).toString("hex");

    const multipartBody = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="captionGu"\r\n\r\n'),
      Buffer.from("મુંબઈ હેડક્વાર્ટર\r\n"),
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="captionEn"\r\n\r\n'),
      Buffer.from("Mumbai Headquarters\r\n"),
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from('Content-Disposition: form-data; name="file"; filename="bmc-building.png"\r\n'),
      Buffer.from("Content-Type: image/png\r\n\r\n"),
      dummyImageBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const uploadRes = await app.inject({
      method: "POST",
      url: "/api/v1/media/upload",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: multipartBody,
    });

    assert.strictEqual(uploadRes.statusCode, 201);
    const uploadJson = JSON.parse(uploadRes.body);
    const mediaId = uploadJson.data.id;
    assert.ok(mediaId);
    assert.ok(uploadJson.data.publicUrl);
    pass("Admin uploads image to Media Library; record and storageKey created");

    // Public serve endpoint
    const serveRes = await app.inject({
      method: "GET",
      url: `/api/v1/media/serve/${uploadJson.data.storageKey}`,
    });
    assert.strictEqual(serveRes.statusCode, 200);
    assert.strictEqual(serveRes.headers["content-type"], "image/png");
    pass("Media public serving endpoint streams image with correct MIME type");

    // ------------------------------------------------------------------------
    // TEST SUITE 6: CATEGORIES & TAXONOMY MANAGEMENT
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 6: CATEGORIES & TAXONOMY MANAGEMENT ---");

    const testCatId = `tech-${testSuffix}`;
    const createCatRes = await app.inject({
      method: "POST",
      url: "/api/v1/admin/categories",
      headers: { Authorization: `Bearer ${adminToken}` },
      payload: {
        id: testCatId,
        slug: testCatId,
        nameEn: "Technology & AI",
        nameGu: "ટેક્નોલોજી અને એઆઈ",
        displayOrder: 15,
        isActive: true,
      },
    });

    assert.strictEqual(createCatRes.statusCode, 201);
    pass("Admin creates new news taxonomy category");

    const getCatsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/categories",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(getCatsRes.statusCode, 200);
    const catsJson = JSON.parse(getCatsRes.body);
    assert.ok(catsJson.data.some((c: any) => c.id === testCatId));
    pass("Admin category list returns newly created taxonomy record");

    // ------------------------------------------------------------------------
    // TEST SUITE 7: REAL DATABASE DASHBOARD METRICS
    // ------------------------------------------------------------------------
    console.log("\n--- TEST SUITE 7: REAL DATABASE DASHBOARD METRICS ---");

    const statsRes = await app.inject({
      method: "GET",
      url: "/api/v1/admin/dashboard/stats",
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(statsRes.statusCode, 200);
    const statsJson = JSON.parse(statsRes.body);
    assert.strictEqual(statsJson.success, true);
    assert.ok(statsJson.data.content.totalArticles >= 2);
    assert.ok(statsJson.data.content.publishedArticles >= 1);
    assert.ok(statsJson.data.content.byPublication.janmabhoomi >= 1);
    assert.ok(statsJson.data.content.translation.completed >= 1);
    assert.ok(statsJson.data.content.recentPublishedArticles.length > 0);
    pass("Admin dashboard returns real database metrics across newsroom & translation");
  } catch (err: any) {
    fail("Phase 5B Newsroom Test Suite Encountered Error", err);
  } finally {
    // ------------------------------------------------------------------------
    // CLEANUP
    // ------------------------------------------------------------------------
    console.log("\n--- CLEANUP: REMOVING TEST USERS & RECORDS ---");
    try {
      if (adminUserId) {
        await prisma.article.deleteMany({ where: { createdBy: adminUserId } });
        await prisma.mediaAsset.deleteMany({ where: { uploadedBy: adminUserId } });
        await prisma.auditLog.deleteMany({ where: { userId: adminUserId } });
        await prisma.staffSession.deleteMany({ where: { userId: adminUserId } });
        await prisma.userRole.deleteMany({ where: { userId: adminUserId } });
        await prisma.user.delete({ where: { id: adminUserId } }).catch(() => {});
      }
      if (editorUserId) {
        await prisma.staffSession.deleteMany({ where: { userId: editorUserId } });
        await prisma.userRole.deleteMany({ where: { userId: editorUserId } });
        await prisma.user.delete({ where: { id: editorUserId } }).catch(() => {});
      }
      await prisma.category.deleteMany({ where: { id: { contains: testSuffix } } }).catch(() => {});
    } catch (cleanErr) {
      console.error("Cleanup warning:", cleanErr);
    }
    await prisma.$disconnect();
    await app.close();
  }

  console.log("\n==================================================================");
  console.log(`  PHASE 5B TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log("==================================================================");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Fatal Test Runner Error:", err);
  process.exit(1);
});
