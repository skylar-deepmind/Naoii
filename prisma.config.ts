import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/naoii",
  },
  migrations: {
    seed: "tsx ./prisma/seed.ts",
  },
});
