import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPluginAsync: FastifyPluginAsync = async (app: FastifyInstance) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });

  // Attach prisma client to fastify instance
  app.decorate("prisma", prisma);

  // Gracefully test connection on ready hook
  app.addHook("onReady", async () => {
    try {
      await prisma.$queryRaw`SELECT 1 as connected`;
      app.log.info("PostgreSQL database connection verified successfully.");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown database connection error";
      app.log.warn(
        `PostgreSQL not connected at ${env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}. Standby mode. (${errorMessage})`
      );
    }
  });

  // Disconnect prisma client on server shutdown
  app.addHook("onClose", async (instance) => {
    instance.log.info("Disconnecting PostgreSQL Prisma client...");
    await instance.prisma.$disconnect();
    instance.log.info("PostgreSQL Prisma client disconnected.");
  });
};

export const prismaPlugin = fp(prismaPluginAsync, {
  name: "prisma-lifecycle",
  fastify: "5.x",
});

export default prismaPlugin;
