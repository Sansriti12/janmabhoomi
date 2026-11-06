import { buildApp } from "./app.js";
import { env } from "./config/env.js";

async function startServer(): Promise<void> {
  const app = buildApp();

  try {
    const address = await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(
      `Janmabhoomi Backend Service listening at ${address} [Environment: ${env.NODE_ENV}]`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
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
