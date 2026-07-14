import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Naoii database...\n");

  // ─── Languages ────────────────────────────────────
  const languages = [
    { code: "ja", name: "Japanese", nativeName: "日本語" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "en", name: "English", nativeName: "English" },
    { code: "ko", name: "Korean", nativeName: "한국어" },
  ];

  console.log("📚 Seeding languages...");
  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: lang,
      create: lang,
    });
    console.log(`   ✓ ${lang.nativeName} (${lang.code})`);
  }

  // ─── Demo admin user ──────────────────────────────
  console.log("\n👤 Seeding demo admin user...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@naoii.dev" },
    update: {},
    create: {
      username: "admin",
      email: "admin@naoii.dev",
      passwordHash: "$2b$10$placeholder_hash_for_dev_only",
      role: "ADMIN",
      profile: {
        create: {
          displayName: "Naoii Admin",
          bio: "平台管理员",
          level: "MASTERY",
          reputationScore: 1000,
        },
      },
    },
  });
  console.log(`   ✓ admin (id: ${admin.id})`);

  // ─── Summary ──────────────────────────────────────
  const langCount = await prisma.language.count();
  const userCount = await prisma.user.count();
  console.log(`\n✅ Seed complete: ${langCount} languages, ${userCount} users`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
