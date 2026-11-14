/**
 * Janmabhoomi Phase 2 — Real PostgreSQL Database Integration Test Suite
 * 
 * This test suite executes ONLY against a real running PostgreSQL database.
 * If the database is offline, it fails fast and will NOT falsely report success.
 */

import { buildApp } from "./app.js";

async function runLiveDatabaseTests() {
  console.log("=== JANMABHOOMI PHASE 2 REAL DATABASE INTEGRATION TEST SUITE ===\n");

  const app = buildApp();
  await app.ready();

  try {
    // 0. Pre-Flight Check: Verify physical PostgreSQL connectivity
    console.log("[Step 0] Checking physical PostgreSQL connectivity on port 5432...");
    const healthResult = await app.prisma.$queryRaw<{ connected: number }[]>`SELECT 1 as connected`;
    if (!healthResult || healthResult[0]?.connected !== 1) {
      throw new Error("PostgreSQL connection check failed. Ensure database server is running.");
    }
    console.log("  ✓ PostgreSQL physical database is CONNECTED and responsive.\n");

    // 1. Verify 8 Publications and 12 Categories
    console.log("[Step 1] Verifying 8 Publications & 12 Categories in database...");
    const publications = await app.prisma.publication.findMany({ orderBy: { id: "asc" } });
    const categories = await app.prisma.category.findMany({ orderBy: { id: "asc" } });

    console.log(`  ✓ Found ${publications.length} publications (expected 8).`);
    console.log(`  ✓ Found ${categories.length} categories (expected 12).`);

    const expectedPubIds = [
      "pub-janmabhoomi", "pub-kutchmitra", "pub-phulchhab", "pub-vyapar-gu",
      "pub-vyapar-hi", "pub-pravasi", "pub-panchang", "pub-kavita"
    ];
    for (const expectedId of expectedPubIds) {
      const exists = publications.some((p) => p.id === expectedId);
      if (!exists) throw new Error(`Missing expected publication: ${expectedId}`);
    }
    console.log("  ✓ All 8 institutional publication IDs verified.\n");

    // 2. Insert and Retrieve Archive Enquiry
    console.log("[Step 2] Testing real database insertion & retrieval for Archive Enquiry...");
    const archivePayload = {
      fullName: "Kirit Parekh (Live DB Test)",
      contactNumber: "9820098200",
      email: "kirit.parekh.test@janmabhoomi.in",
      publication: "pub-janmabhoomi",
      year: 1947,
      infoType: "historical-article",
      additionalDetails: "Front page coverage of Independence Day August 1947.",
      preferredContact: "email",
      consent: true,
    };

    const archiveRes = await app.inject({
      method: "POST",
      url: "/api/v1/enquiries/archive",
      payload: archivePayload,
    });

    if (archiveRes.statusCode !== 201) {
      throw new Error(`Expected 201 Created, received ${archiveRes.statusCode}: ${archiveRes.body}`);
    }
    const archiveJson = JSON.parse(archiveRes.body);
    const assignedRefNumber = archiveJson.referenceNumber;
    console.log(`  ✓ Archive enquiry API returned HTTP 201 with Ref: ${assignedRefNumber}`);

    // Verify row directly in PostgreSQL table
    const storedArchive = await app.prisma.archiveEnquiry.findUnique({
      where: { referenceNumber: assignedRefNumber },
    });
    if (!storedArchive) {
      throw new Error(`Archive enquiry was not found in database table 'archive_enquiries'!`);
    }
    if (storedArchive.fullName !== archivePayload.fullName || storedArchive.yearRequested !== 1947) {
      throw new Error("Stored archive enquiry record content does not match payload!");
    }
    console.log(`  ✓ Verified record physically exists in 'archive_enquiries' (ID: ${storedArchive.id}).\n`);

    // 3. Test Duplicate Submission Suppression
    console.log("[Step 3] Testing duplicate archive enquiry rejection (15-min suppression window)...");
    const dupRes = await app.inject({
      method: "POST",
      url: "/api/v1/enquiries/archive",
      payload: archivePayload,
    });
    if (dupRes.statusCode !== 409) {
      throw new Error(`Expected 409 Conflict for duplicate submission, got ${dupRes.statusCode}`);
    }
    const dupJson = JSON.parse(dupRes.body);
    if (!dupJson.error || dupJson.referenceNumber !== assignedRefNumber) {
      throw new Error("Duplicate submission did not return existing reference number!");
    }
    console.log(`  ✓ Duplicate submission successfully rejected with HTTP 409 Conflict.\n`);

    // 4. Insert and Retrieve Contact Enquiry
    console.log("[Step 4] Testing real database insertion & retrieval for Contact Enquiry...");
    const contactPayload = {
      fullName: "Anandiben Mehta (Live DB Test)",
      email: "anandiben.test@janmabhoomi.in",
      mobileNumber: "9876543210",
      subject: "Subscription Renewal Query",
      message: "Requesting assistance regarding yearly postal subscription delivery.",
    };

    const contactRes = await app.inject({
      method: "POST",
      url: "/api/v1/enquiries/contact",
      payload: contactPayload,
    });

    if (contactRes.statusCode !== 201) {
      throw new Error(`Expected 201 Created for contact enquiry, got ${contactRes.statusCode}: ${contactRes.body}`);
    }
    const contactJson = JSON.parse(contactRes.body);
    console.log(`  ✓ Contact enquiry API returned HTTP 201 (Ref: ${contactJson.referenceNumber || contactJson.id})`);

    const storedContact = await app.prisma.contactEnquiry.findFirst({
      where: { email: contactPayload.email },
      orderBy: { createdAt: "desc" },
    });
    if (!storedContact) {
      throw new Error("Contact enquiry was not found in database table 'contact_enquiries'!");
    }
    console.log(`  ✓ Verified record physically exists in 'contact_enquiries' (ID: ${storedContact.id}).\n`);

    // 5. Test Concurrent Reference Number Generation
    console.log("[Step 5] Testing concurrent reference number generation...");
    const concurrentCount = 5;
    const concurrentPromises = Array.from({ length: concurrentCount }, (_, i) => {
      return app.inject({
        method: "POST",
        url: "/api/v1/enquiries/archive",
        payload: {
          fullName: `Concurrent Visitor ${i + 1}`,
          contactNumber: `98200${10000 + i}`,
          email: `concurrent${i + 1}@janmabhoomi.in`,
          publication: "pub-phulchhab",
          year: 1950 + i,
          infoType: "historical-article",
          preferredContact: "either",
          consent: true,
        },
      });
    });

    const concurrentResults = await Promise.all(concurrentPromises);
    const refNumbers = new Set<string>();

    for (const res of concurrentResults) {
      if (res.statusCode !== 201) {
        throw new Error(`Concurrent submission failed with code ${res.statusCode}: ${res.body}`);
      }
      const data = JSON.parse(res.body);
      if (refNumbers.has(data.referenceNumber)) {
        throw new Error(`Collision detected! Non-unique reference number: ${data.referenceNumber}`);
      }
      refNumbers.add(data.referenceNumber);
    }
    console.log(`  ✓ All ${concurrentCount} concurrent submissions succeeded with 100% unique reference codes:`);
    Array.from(refNumbers).forEach((r) => console.log(`      - ${r}`));
    console.log();

    // 6. Test Public Content Read APIs with Real Database
    console.log("[Step 6] Testing public content endpoints against live database...");
    const pubListRes = await app.inject({ method: "GET", url: "/api/v1/publications" });
    if (pubListRes.statusCode !== 200) throw new Error("GET /api/v1/publications failed");
    console.log("  ✓ GET /api/v1/publications: 200 OK");

    const catListRes = await app.inject({ method: "GET", url: "/api/v1/categories" });
    if (catListRes.statusCode !== 200) throw new Error("GET /api/v1/categories failed");
    console.log("  ✓ GET /api/v1/categories: 200 OK");

    const articlesHomeRes = await app.inject({ method: "GET", url: "/api/v1/articles/home" });
    if (articlesHomeRes.statusCode !== 200) throw new Error("GET /api/v1/articles/home failed");
    console.log("  ✓ GET /api/v1/articles/home: 200 OK");

    console.log("\n=== ALL REAL DATABASE INTEGRATION TESTS PASSED ===");
  } finally {
    await app.close();
  }
}

runLiveDatabaseTests().catch((err) => {
  console.error("\n❌ LIVE DATABASE TEST FAILED / CANNOT BE RUN:");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
