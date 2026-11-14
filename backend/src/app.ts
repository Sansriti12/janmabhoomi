import Fastify, { FastifyInstance, FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rawBody from "fastify-raw-body";
import { env } from "./config/env.js";
import { prismaPlugin } from "./plugins/prisma.js";
import { enquiriesRoutes } from "./routes/enquiries.js";
import { contentRoutes } from "./routes/content.js";
import { epaperRoutes } from "./routes/epaper.js";
import { subscriberAuthRoutes } from "./routes/subscriberAuth.js";
import { paymentRoutes } from "./routes/payments.js";
import { subscriptionRoutes } from "./routes/subscriptions.js";
import { adminPaymentRoutes } from "./routes/adminPayments.js";
import { staffAuthRoutes } from "./routes/staffAuth.js";
import { adminStaffRoutes } from "./routes/adminStaff.js";
import { adminDashboardRoutes } from "./routes/adminDashboard.js";
import { adminArticlesRoutes } from "./routes/adminArticles.js";
import { adminMediaRoutes } from "./routes/adminMedia.js";
import { adminCategoriesRoutes } from "./routes/adminCategories.js";

const startTime = Date.now();

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger:
      env.NODE_ENV === "test"
        ? false
        : {
            level: env.NODE_ENV === "development" ? "info" : "warn",
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers['x-razorpay-signature']",
                "req.body.password",
                "req.body.currentPassword",
                "req.body.newPassword",
              ],
              censor: "[REDACTED]",
            },
          },
  });

  // Security headers via Helmet
  app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === "production",
  });

  // CORS configuration
  const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim());
  app.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return cb(null, true);
      }
      return cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });

  // Multipart streaming upload support for PDF files
  app.register(multipart, {
    limits: {
      fileSize: env.MAX_PDF_UPLOAD_SIZE_MB * 1024 * 1024,
      files: 1,
    },
  });

  // Raw body plugin for Razorpay webhook verification
  app.register(rawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
    routes: ["/api/v1/payments/webhook"],
  });

  // Prisma Database Lifecycle Plugin
  app.register(prismaPlugin);

  // Register API Routes
  app.register(enquiriesRoutes, { prefix: "/api/v1/enquiries" });
  app.register(contentRoutes, { prefix: "/api/v1" });
  app.register(epaperRoutes, { prefix: "/api/v1/epaper" });
  app.register(subscriberAuthRoutes, { prefix: "/api/v1/subscriber/auth" });
  app.register(paymentRoutes, { prefix: "/api/v1/payments" });
  app.register(subscriptionRoutes, { prefix: "/api/v1/subscriptions" });
  app.register(adminPaymentRoutes, { prefix: "/api/v1/admin/payments" });
  app.register(staffAuthRoutes, { prefix: "/api/v1/admin/auth" });
  app.register(adminStaffRoutes, { prefix: "/api/v1/admin/staff" });
  app.register(adminDashboardRoutes, { prefix: "/api/v1/admin" });
  app.register(adminArticlesRoutes, { prefix: "/api/v1/admin/articles" });
  app.register(adminMediaRoutes, { prefix: "/api/v1/media" });
  app.register(adminCategoriesRoutes, { prefix: "/api/v1/admin/categories" });

  // Root information endpoint
  app.get("/", async (_request, _reply) => {
    return {
      service: "Janmabhoomi Digital Newspaper Backend",
      organization: "Saurashtra Trust",
      version: "0.1.0",
      status: "online",
      endpoints: {
        health: "/health",
        healthDb: "/health/db",
        publications: "/api/v1/publications",
        categories: "/api/v1/categories",
        articlesHome: "/api/v1/articles/home",
        articlesLatest: "/api/v1/articles/latest",
        editorialsToday: "/api/v1/editorials/today",
        panchang: "/api/v1/panchang/:date",
        archiveEnquiry: "POST /api/v1/enquiries/archive",
        contactEnquiry: "POST /api/v1/enquiries/contact",
        epaperPublications: "/api/v1/epaper/publications",
        epaperEditions: "/api/v1/epaper/editions",
        epaperAdminEditions: "/api/v1/epaper/admin/editions",
        subscriberRegister: "POST /api/v1/subscriber/auth/register",
        subscriberLogin: "POST /api/v1/subscriber/auth/login",
        subscriberMe: "GET /api/v1/subscriber/auth/me",
        paymentCreateOrder: "POST /api/v1/payments/create-order",
        paymentVerify: "POST /api/v1/payments/verify",
        paymentWebhook: "POST /api/v1/payments/webhook",
        subscriptionPlans: "GET /api/v1/subscriptions/plans",
        subscriptionMy: "GET /api/v1/subscriptions/my",
        adminPaymentTransactions: "GET /api/v1/admin/payments/transactions",
      },
    };
  });

  // Comprehensive Health Check Endpoint
  app.get("/health", async (_request, _reply) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    let databaseStatus = "disconnected";
    let dbLatencyMs: number | null = null;

    try {
      const dbStart = Date.now();
      await app.prisma.$queryRaw`SELECT 1 as health_check`;
      dbLatencyMs = Date.now() - dbStart;
      databaseStatus = "connected";
    } catch {
      databaseStatus = "disconnected";
    }

    return {
      status: "ok",
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      service: "janmabhoomi-backend",
      environment: env.NODE_ENV,
      version: "0.1.0",
      database: {
        status: databaseStatus,
        latencyMs: dbLatencyMs,
      },
    };
  });

  // Dedicated Database Health Check Endpoint
  app.get("/health/db", async (_request, reply) => {
    try {
      const dbStart = Date.now();
      await app.prisma.$queryRaw`SELECT 1 as health_check`;
      const latencyMs = Date.now() - dbStart;

      return {
        status: "ok",
        database: "PostgreSQL 16",
        connected: true,
        latencyMs,
      };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Database connection failed";
      reply.status(503);
      return {
        status: "degraded",
        database: "PostgreSQL 16",
        connected: false,
        error: errorMessage,
      };
    }
  });

  // Centralized Error Handler
  app.setErrorHandler((error: FastifyError, _request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode || 500;
    const message =
      statusCode >= 500 && env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message || "An unexpected error occurred";

    reply.status(statusCode).send({
      success: false,
      error: {
        statusCode,
        code: error.code || "INTERNAL_ERROR",
        message,
      },
    });
  });

  return app;
}
