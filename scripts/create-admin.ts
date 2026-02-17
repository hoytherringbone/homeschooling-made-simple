import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const EMAIL = process.env.ADMIN_EMAIL || "admin@hsms.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const NAME = process.env.ADMIN_NAME || "Site Admin";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const db = new PrismaClient({ adapter });

  const existing = await db.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    console.log(`User with email ${EMAIL} already exists (role: ${existing.role}).`);
    if (existing.role !== "SUPER_ADMIN") {
      await db.user.update({
        where: { id: existing.id },
        data: { role: "SUPER_ADMIN" },
      });
      console.log("Updated role to SUPER_ADMIN.");
    }
    await db.$disconnect();
    return;
  }

  let adminFamily = await db.family.findFirst({
    where: { name: "HSMS Administration" },
  });

  if (!adminFamily) {
    adminFamily = await db.family.create({
      data: {
        name: "HSMS Administration",
        subscriptionStatus: "active",
        trialEndsAt: new Date("2099-12-31"),
      },
    });
    console.log("Created admin family.");
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  await db.user.create({
    data: {
      email: EMAIL,
      name: NAME,
      hashedPassword,
      role: "SUPER_ADMIN",
      familyId: adminFamily.id,
      onboarded: true,
    },
  });

  console.log(`Super admin created: ${EMAIL}`);
  console.log("You can now log in with these credentials.");

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
