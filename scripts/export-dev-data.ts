import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function exportData() {
  const [
    families,
    users,
    students,
    subjects,
    assignments,
    assignmentTemplates,
    comments,
    activityLogs,
    goals,
    attendanceLogs,
    notifications,
  ] = await Promise.all([
    prisma.family.findMany(),
    prisma.user.findMany(),
    prisma.student.findMany(),
    prisma.subject.findMany(),
    prisma.assignment.findMany(),
    prisma.assignmentTemplate.findMany(),
    prisma.comment.findMany(),
    prisma.activityLog.findMany(),
    prisma.goal.findMany(),
    prisma.attendanceLog.findMany(),
    prisma.notification.findMany(),
  ]);

  const data = {
    families,
    users,
    subjects,
    students,
    assignmentTemplates,
    assignments,
    comments,
    activityLogs,
    goals,
    attendanceLogs,
    notifications,
  };

  const fs = await import("fs");
  fs.writeFileSync(
    "scripts/dev-data-export.json",
    JSON.stringify(data, null, 2)
  );

  console.log("Exported:");
  console.log(`  ${families.length} families`);
  console.log(`  ${users.length} users`);
  console.log(`  ${students.length} students`);
  console.log(`  ${subjects.length} subjects`);
  console.log(`  ${assignments.length} assignments`);
  console.log(`  ${assignmentTemplates.length} templates`);
  console.log(`  ${comments.length} comments`);
  console.log(`  ${activityLogs.length} activity logs`);
  console.log(`  ${goals.length} goals`);
  console.log(`  ${attendanceLogs.length} attendance logs`);
  console.log(`  ${notifications.length} notifications`);

  await prisma.$disconnect();
}

exportData().catch((e) => {
  console.error("Export failed:", e);
  process.exit(1);
});
