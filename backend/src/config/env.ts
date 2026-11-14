import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

// Load .env from backend root if present
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z
    .string()
    .default("4000")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val < 65536, {
      message: "PORT must be a valid integer between 1 and 65535",
    }),
  HOST: z.string().default("127.0.0.1"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/janmabhoomi_dev?schema=public"),
  EPAPER_STORAGE_DIR: z
    .string()
    .default("storage/epaper"),
  MAX_PDF_UPLOAD_SIZE_MB: z
    .string()
    .default("100")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 500, {
      message: "MAX_PDF_UPLOAD_SIZE_MB must be between 1 and 500",
    }),
  RAZORPAY_KEY_ID: z
    .string()
    .default("rzp_test_placeholder_key_id"),
  RAZORPAY_KEY_SECRET: z
    .string()
    .default("rzp_test_placeholder_key_secret"),
  RAZORPAY_WEBHOOK_SECRET: z
    .string()
    .default("rzp_test_placeholder_webhook_secret"),
  RAZORPAY_MODE: z
    .enum(["test", "live"])
    .default("test"),
  SUBSCRIBER_JWT_SECRET: z
    .string()
    .default("janmabhoomi_subscriber_session_secret_2026"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }

  return result.data;
}

export const env = loadEnv();
