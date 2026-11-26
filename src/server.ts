import { app } from "./app.js";
import { port } from "./config.js";
import { prisma } from "./lib/prisma.js";

const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

let isShuttingDown = false;

function shutdown(signal: NodeJS.Signals): void {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`Received ${signal}; shutting down.`);

  server.close((error) => {
    if (error) {
      console.error("Failed to close HTTP server", error);
      process.exitCode = 1;
    }

    void prisma.$disconnect().then(
      () => console.log("Prisma disconnected."),
      (disconnectError: unknown) => {
        console.error("Failed to disconnect Prisma", disconnectError);
        process.exitCode = 1;
      },
    );
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
