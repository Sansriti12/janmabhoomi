import Fastify, { FastifyInstance, FastifyError } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { env } from "./config/env.js";

const startTime = Date.now();

export function buildApp(): FastifyInstance {
  const app = Fastify({
    logger:
      env.NODE_ENV === "test"
        ? false
        : {
            level: env.NODE_ENV === "development" ? "info" : "warn",
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

  // Root information endpoint
  app.get("/", async (_request, _reply) => {
    return {
      service: "Janmabhoomi Digital Newspaper Backend",
      organization: "Saurashtra Trust",
      version: "0.1.0",
      status: "online",
      healthCheck: "/health",
    };
  });

  // Health check endpoint
  app.get("/health", async (_request, _reply) => {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
    return {
      status: "ok",
      uptimeSeconds,
      timestamp: new Date().toISOString(),
      service: "janmabhoomi-backend",
      environment: env.NODE_ENV,
      version: "0.1.0",
    };
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
