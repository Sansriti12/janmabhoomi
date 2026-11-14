import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { publishDueScheduledArticles } from "./routes/adminArticles.js";

async function startServer(): Promise<void> {
  const app = buildApp();
  let scheduleTimer: NodeJS.Timeout | null = null;

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(
      `Janmabhoomi Backend Service listening at ${address} [Environment: ${env.NODE_ENV}]`
    );

    // Development & In-Process Persistent Scheduler:
    // 1. Immediate backlog evaluation on startup (recovers any articles scheduled during downtime)
    void publishDueScheduledArticles(app.prisma, app.log).catch((err) => {
      app.log.error({ err }, "Initial backlog processing for scheduled articles failed");
    });

    // 2. Periodic background publisher running without requiring manual dashboard access.
    const intervalMs = env.NODE_ENV === "production" ? 60000 : 30000;
    scheduleTimer = setInterval(async () => {
      try {
        await publishDueScheduledArticles(app.prisma, app.log);
      } catch (scheduleErr) {
        app.log.error({ err: scheduleErr }, "Background scheduled publisher encountered error");
      }
    }, intervalMs);

    // Unref timer so it does not prevent node event loop exit if needed
    if (scheduleTimer.unref) {
      scheduleTimer.unref();
    }
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      if (scheduleTimer) {
        clearInterval(scheduleTimer);
        scheduleTimer = null;
      }
      app.log.info(`Received ${signal}, initiating graceful shutdown...`);
      try {
        await app.close();
        app.log.info("Server closed successfully.");
        process.exit(0);
      } catch (err) {
        app.log.error(err, "Error during graceful shutdown");
        process.exit(1);
      }
    });
  }
}

// Start execution
void startServer();
