import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function importData() {
  const raw = fs.readFileSync("scripts/dev-data-export.json", "utf-8");
  const data = JSON.parse(raw);

  let created = 0;
  let skipped = 0;

  async function upsertBatch<T extends Record<string, any>>(
    label: string,
    items: T[],
    model: any,
    idField: string = "id"
  ) {
    for (const item of items) {
      try {
        const existing = await model.findUnique({
          where: { [idField]: item[idField] },
        });
        if (existing) {
          skipped++;
        } else {
          await model.create({ data: item });
          created++;
        }
      } catch (e: any) {
        if (e?.code === "P2002") {
          skipped++;
        } else {
          console.error(`  Error importing ${label} ${item[idField]}:`, e.message);
        }
      }
    }
    console.log(`  ${label}: processed ${items.length} records`);
  }

  console.log("Starting data import...\n");

  await upsertBatch("Families", data.families || [], prisma.family);
  await upsertBatch("Users", data.users || [], prisma.user);
  await upsertBatch("Subjects", data.subjects || [], prisma.subject);
  await upsertBatch("Students", data.students || [], prisma.student);
  await upsertBatch("Assignment Templates", data.assignmentTemplates || [], prisma.assignmentTemplate);
  await upsertBatch("Assignments", data.assignments || [], prisma.assignment);
  await upsertBatch("Comments", data.comments || [], prisma.comment);
  await upsertBatch("Activity Logs", data.activityLogs || [], prisma.activityLog);
  await upsertBatch("Goals", data.goals || [], prisma.goal);
  await upsertBatch("Attendance Logs", data.attendanceLogs || [], prisma.attendanceLog);
  await upsertBatch("Notifications", data.notifications || [], prisma.notification);

  console.log(`\nDone! Created: ${created}, Skipped (already existed): ${skipped}`);

  await prisma.$disconnect();
}

importData().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});
