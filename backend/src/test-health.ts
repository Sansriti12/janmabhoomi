import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function verifyBackend(): Promise<void> {
  console.log("--- JANMABHOOMI BACKEND TASK 1 VERIFICATION ---");
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Configured Host: ${env.HOST}, Port: ${env.PORT}`);

  const app = buildApp();

  // Test 1: Fastify Inject GET /health
  console.log("\n[Test 1] Testing /health via Fastify inject...");
  const injectHealth = await app.inject({
    method: "GET",
    url: "/health",
  });

  if (injectHealth.statusCode !== 200) {
    throw new Error(`Expected 200, got ${injectHealth.statusCode}: ${injectHealth.body}`);
  }
  const healthJson = JSON.parse(injectHealth.body);
  console.log("✓ /health injected response status:", injectHealth.statusCode);
  console.log("✓ /health payload:", JSON.stringify(healthJson, null, 2));

  if (healthJson.status !== "ok" || healthJson.service !== "janmabhoomi-backend") {
    throw new Error("Invalid health check payload contents");
  }

  // Test 2: Fastify Inject GET /
  console.log("\n[Test 2] Testing / (Root info) via Fastify inject...");
  const injectRoot = await app.inject({
    method: "GET",
    url: "/",
  });
  if (injectRoot.statusCode !== 200) {
    throw new Error(`Expected 200, got ${injectRoot.statusCode}: ${injectRoot.body}`);
  }
  const rootJson = JSON.parse(injectRoot.body);
  console.log("✓ / injected response status:", injectRoot.statusCode);
  console.log("✓ / payload:", JSON.stringify(rootJson, null, 2));

  // Test 3: Real HTTP Listen & Network Fetch
  console.log(`\n[Test 3] Binding to network http://${env.HOST}:${env.PORT}...`);
  const address = await app.listen({ port: env.PORT, host: env.HOST });
  console.log(`✓ Server successfully listening at ${address}`);

  const res = await fetch(`http://${env.HOST}:${env.PORT}/health`);
  console.log(`✓ Real HTTP fetch returned status: ${res.status}`);
  const networkJson = (await res.json()) as { status?: string };
  console.log("✓ Real HTTP response payload:", JSON.stringify(networkJson, null, 2));

  if (res.status !== 200 || networkJson.status !== "ok") {
    throw new Error("Real HTTP fetch failed validation");
  }

  // Test 4: 404 Route handling
  console.log("\n[Test 4] Testing 404 handling...");
  const res404 = await fetch(`http://${env.HOST}:${env.PORT}/non-existent-route`);
  console.log(`✓ 404 route returned status: ${res404.status}`);
  if (res404.status !== 404) {
    throw new Error(`Expected 404, got ${res404.status}`);
  }

  // Clean shutdown
  console.log("\n[Teardown] Closing server cleanly...");
  await app.close();
  console.log("✓ Server closed cleanly.");
  console.log("\n--- ALL TASK 1 HEALTH & BACKEND CHECKS PASSED ---");
}

verifyBackend().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
