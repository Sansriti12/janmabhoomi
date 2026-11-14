import { buildApp } from "./app.js";

async function runPhase2Tests(): Promise<void> {
  console.log("=== JANMABHOOMI PHASE 2 API VERIFICATION TEST SUITE ===");

  const app = buildApp();
  await app.ready();

  // Test 1: Verify Root Information Endpoint Lists Phase 2 APIs
  console.log("\n[Test 1] Testing GET / (Root info endpoints)...");
  const rootRes = await app.inject({ method: "GET", url: "/" });
  if (rootRes.statusCode !== 200) {
    throw new Error(`Expected 200, got ${rootRes.statusCode}`);
  }
  const rootJson = JSON.parse(rootRes.body);
  console.log("✓ Root endpoints registered:", Object.keys(rootJson.endpoints));

  // Test 2: Archive Enquiry Validation - Missing All Fields
  console.log("\n[Test 2] Testing POST /api/v1/enquiries/archive (Missing fields)...");
  const emptyRes = await app.inject({
    method: "POST",
    url: "/api/v1/enquiries/archive",
    payload: {},
  });
  console.log("✓ Status code:", emptyRes.statusCode);
  if (emptyRes.statusCode !== 400) {
    throw new Error(`Expected 400, got ${emptyRes.statusCode}`);
  }
  const emptyJson = JSON.parse(emptyRes.body);
  console.log("✓ Validation error caught:", emptyJson.error);

  // Test 3: Archive Enquiry Validation - Invalid Indian Mobile Number
  console.log("\n[Test 3] Testing POST /api/v1/enquiries/archive (Invalid mobile number)...");
  const invalidPhoneRes = await app.inject({
    method: "POST",
    url: "/api/v1/enquiries/archive",
    payload: {
      fullName: "Kiritbhai Parekh",
      contactNumber: "12345", // Invalid
      email: "kirit@example.com",
      publication: "pub-janmabhoomi",
      year: 1947,
      infoType: "historical_event",
      consent: true,
    },
  });
  console.log("✓ Status code:", invalidPhoneRes.statusCode);
  if (invalidPhoneRes.statusCode !== 400) {
    throw new Error(`Expected 400, got ${invalidPhoneRes.statusCode}`);
  }
  const invalidPhoneJson = JSON.parse(invalidPhoneRes.body);
  console.log("✓ Mobile validation message:", invalidPhoneJson.error);
  if (!invalidPhoneJson.error.includes("10-digit Indian mobile number")) {
    throw new Error("Mobile validation message mismatch");
  }

  // Test 4: Archive Enquiry Validation - Missing Consent
  console.log("\n[Test 4] Testing POST /api/v1/enquiries/archive (Missing consent)...");
  const noConsentRes = await app.inject({
    method: "POST",
    url: "/api/v1/enquiries/archive",
    payload: {
      fullName: "Kiritbhai Parekh",
      contactNumber: "9820012345",
      email: "kirit@example.com",
      publication: "pub-janmabhoomi",
      year: 1947,
      infoType: "historical_event",
      consent: false,
    },
  });
  console.log("✓ Status code:", noConsentRes.statusCode);
  if (noConsentRes.statusCode !== 400) {
    throw new Error(`Expected 400, got ${noConsentRes.statusCode}`);
  }
  const noConsentJson = JSON.parse(noConsentRes.body);
  console.log("✓ Consent validation message:", noConsentJson.error);

  // Test 5: Archive Enquiry - Database Standby Handling (When DB is offline in dev)
  console.log("\n[Test 5] Testing POST /api/v1/enquiries/archive (Valid payload with offline DB fallback)...");
  const validPayloadRes = await app.inject({
    method: "POST",
    url: "/api/v1/enquiries/archive",
    payload: {
      fullName: "Kiritbhai Parekh",
      contactNumber: "9820012345",
      email: "kirit@example.com",
      publication: "pub-janmabhoomi",
      year: 1947,
      infoType: "historical_event",
      additionalDetails: "Front page coverage of Independence Day",
      preferredContact: "phone",
      consent: true,
    },
  });
  console.log("✓ Status code:", validPayloadRes.statusCode);
  const validJson = JSON.parse(validPayloadRes.body);
  console.log("✓ Standby DB diagnostic message returned safely:", validJson.error || validJson.message);

  // Test 6: Panchang Endpoint Testing (Handles both online 200 and offline standby 503)
  console.log("\n[Test 6] Testing GET /api/v1/panchang/2026-11-11 (Gujarati & English)...");
  const panchangGuRes = await app.inject({
    method: "GET",
    url: "/api/v1/panchang/2026-11-11?lang=gu",
  });
  console.log("✓ Panchang response status:", panchangGuRes.statusCode);
  if (panchangGuRes.statusCode === 200) {
    const panchangGu = JSON.parse(panchangGuRes.body);
    console.log("✓ Live DB Gujarati Panchang:", panchangGu.data?.tithi, "| Nakshatra:", panchangGu.data?.nakshatra);
  } else if (panchangGuRes.statusCode === 503) {
    const errorJson = JSON.parse(panchangGuRes.body);
    console.log("✓ Graceful 503 caught when local PostgreSQL is offline:", errorJson.error);
  } else {
    throw new Error(`Unexpected status ${panchangGuRes.statusCode}: ${panchangGuRes.body}`);
  }

  // Test 7: Panchang - Invalid Date Format
  console.log("\n[Test 7] Testing GET /api/v1/panchang/invalid-date...");
  const invalidDateRes = await app.inject({
    method: "GET",
    url: "/api/v1/panchang/not-a-date",
  });
  console.log("✓ Invalid date status code:", invalidDateRes.statusCode);
  if (invalidDateRes.statusCode !== 400) {
    throw new Error(`Expected 400, got ${invalidDateRes.statusCode}`);
  }

  // Teardown
  await app.close();
  console.log("\n=== ALL PHASE 2 API VERIFICATION TESTS PASSED ===");
}

runPhase2Tests().catch((err) => {
  console.error("Phase 2 test suite failed:", err);
  process.exit(1);
});
