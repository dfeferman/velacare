import { config } from "dotenv";
// Load .env.local first (Next.js convention), then .env as fallback
config({ path: ".env.local", override: false });
config();

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For migrations: set DATABASE_URL to the direct connection (port 5432, no pgbouncer)
    // For runtime: DATABASE_URL uses the transaction pooler (port 6543, ?pgbouncer=true)
    url: process.env["DATABASE_URL"]!,
  },
});
