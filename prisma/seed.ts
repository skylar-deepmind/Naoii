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

  // ─── Admin user ────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminUsername = process.env.ADMIN_USERNAME || "admin";

  if (adminEmail && adminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      console.log(`\n👤 Admin user already exists: ${existing.email}`);
    } else {
      console.log(`\n👤 Creating admin user: ${adminEmail}...`);
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(adminPassword, 12);
      await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
          username: adminUsername,
          email: adminEmail,
          passwordHash: hash,
          role: "ADMIN",
          profile: {
            create: {
              displayName: "Admin",
              level: "MASTERY",
              reputationScore: 0,
            },
          },
        },
      });
      console.log(`   ✓ Admin created: ${adminEmail}`);
    }
  } else {
    console.log("\n⚠ ADMIN_EMAIL / ADMIN_PASSWORD not set, skipping admin creation.");
    console.log("  Set these env vars and re-run 'npx tsx prisma/seed.ts' to create an admin.");
  }

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
