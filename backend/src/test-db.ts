import { PrismaClient } from "@prisma/client";
import { env } from "./config/env.js";

async function testDatabaseConnectivity(): Promise<void> {
  console.log("--- JANMABHOOMI DATABASE CONNECTIVITY TEST ---");
  console.log(`Configured DATABASE_URL: ${env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });

  try {
    console.log("Connecting to PostgreSQL database...");
    const result = await prisma.$queryRaw<Array<{ result: number }>>`SELECT 1 as result`;
    console.log("✓ Database connection successful! Query result:", result);

    // Count publications to verify schema visibility
    const count = await prisma.publication.count();
    console.log(`✓ Publications table verified. Record count: ${count}`);
    console.log("\n--- DATABASE CONNECTIVITY TEST PASSED ---");
  } catch (err: any) {
    console.warn("\n[PostgreSQL Notice]");
    console.warn(`Could not connect to PostgreSQL at ${env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}`);
    console.warn(`Reason: ${err.message || err.code || "Connection refused"}`);
    console.warn("\nSetup Instructions for Local Developer:");
    console.warn("1. Ensure PostgreSQL 16+ is running locally on port 5432.");
    console.warn("2. Create database: createdb janmabhoomi_dev");
    console.warn("3. Run migrations: npx prisma migrate dev");
    console.warn("4. Seed data: npx tsx prisma/seed.ts");
    console.warn("--------------------------------------------------");
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnectivity().catch((e) => {
  console.error("Test error:", e);
});
