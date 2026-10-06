import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./database/prisma.client.js";

const app = createApp();

async function start() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connecté");

    app.listen(env.PORT, () => {
      console.log(`🚀 EVENTIA API sur http://localhost:${env.PORT}`);
      console.log(`📍 Plateforme événementielle — Oran, Algérie`);
    });
  } catch (err) {
    console.error("❌ Erreur démarrage:", err);
    process.exit(1);
  }
}

start();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
