import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await db.notification.deleteMany();
  await db.activityLog.deleteMany();
  await db.comment.deleteMany();
  await db.assignment.deleteMany();
  await db.assignmentTemplate.deleteMany();
  await db.goal.deleteMany();
  await db.attendanceLog.deleteMany();
  await db.subject.deleteMany();
  await db.student.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();
  await db.family.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create demo family
  const family = await db.family.create({
    data: {
      name: "The Smith Family",
      subscriptionStatus: "trial",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Create parent user
  const parent = await db.user.create({
    data: {
      email: "parent@demo.com",
      name: "Sarah Smith",
      hashedPassword,
      role: "PARENT",
      familyId: family.id,
      onboarded: true,
    },
  });

  // Create student users
  const emmaUser = await db.user.create({
    data: {
      email: "emma@demo.com",
      name: "Emma Smith",
      hashedPassword,
      role: "STUDENT",
      familyId: family.id,
      onboarded: true,
    },
  });

  const liamUser = await db.user.create({
    data: {
      email: "liam@demo.com",
      name: "Liam Smith",
      hashedPassword,
      role: "STUDENT",
      familyId: family.id,
      onboarded: true,
    },
  });

  // Create student profiles linked to user accounts
  const emma = await db.student.create({
    data: {
      name: "Emma",
      gradeLevel: "5th",
      familyId: family.id,
      userId: emmaUser.id,
    },
  });

  const liam = await db.student.create({
    data: {
      name: "Liam",
      gradeLevel: "3rd",
      familyId: family.id,
      userId: liamUser.id,
    },
  });

  // Create subjects
  const math = await db.subject.create({
    data: { name: "Math", color: "#0D9488", familyId: family.id },
  });

  const reading = await db.subject.create({
    data: { name: "Reading", color: "#2563EB", familyId: family.id },
  });

  const science = await db.subject.create({
    data: { name: "Science", color: "#9333EA", familyId: family.id },
  });

  const languageArts = await db.subject.create({
    data: { name: "Language Arts", color: "#16A34A", familyId: family.id },
  });

  const history = await db.subject.create({
    data: { name: "History", color: "#F59E0B", familyId: family.id },
  });

  await db.subject.create({
    data: { name: "Art", color: "#E11D48", familyId: family.id },
  });

  // Create assignments
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const fractions = await db.assignment.create({
    data: {
      title: "Chapter 5: Fractions",
      description: "Complete exercises 1-20 on page 87. Show your work for each problem.",
      status: "ASSIGNED",
      priority: "HIGH",
      dueDate: tomorrow,
      estimatedMinutes: 45,
      studentId: emma.id,
      subjectId: math.id,
      familyId: family.id,
    },
  });

  const charlottesWeb = await db.assignment.create({
    data: {
      title: "Read Charlotte's Web Ch. 1-3",
      description: "Read and write a short summary paragraph for each chapter.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      dueDate: tomorrow,
      estimatedMinutes: 30,
      studentId: emma.id,
      subjectId: reading.id,
      familyId: family.id,
    },
  });

  const additionWorksheet = await db.assignment.create({
    data: {
      title: "Addition Worksheet",
      description: "Complete the two-digit addition worksheet. Try to finish without a calculator!",
      status: "SUBMITTED",
      priority: "MEDIUM",
      dueDate: now,
      estimatedMinutes: 20,
      studentId: liam.id,
      subjectId: math.id,
      familyId: family.id,
    },
  });

  const solarSystem = await db.assignment.create({
    data: {
      title: "Solar System Poster",
      description: "Create a poster showing the planets in order from the sun.",
      status: "COMPLETED",
      priority: "LOW",
      dueDate: twoDaysAgo,
      completedDate: yesterday,
      estimatedMinutes: 60,
      studentId: emma.id,
      subjectId: science.id,
      familyId: family.id,
    },
  });

  // RETURNED assignment with feedback
  const spellingTest = await db.assignment.create({
    data: {
      title: "Spelling Test Practice",
      description: "Practice spelling words from Unit 4. Write each word 3 times.",
      status: "RETURNED",
      priority: "MEDIUM",
      dueDate: yesterday,
      estimatedMinutes: 15,
      studentId: liam.id,
      subjectId: reading.id,
      familyId: family.id,
    },
  });

  // Extra assignment for Emma — upcoming
  await db.assignment.create({
    data: {
      title: "Science Lab Report",
      description: "Write up the results from our plant growth experiment. Include a hypothesis, observations, and conclusion.",
      status: "ASSIGNED",
      priority: "MEDIUM",
      dueDate: nextWeek,
      estimatedMinutes: 40,
      studentId: emma.id,
      subjectId: science.id,
      familyId: family.id,
    },
  });

  // Comments
  await db.comment.createMany({
    data: [
      {
        content: "I started reading but Chapter 2 is really long. Can I finish tomorrow?",
        authorId: emmaUser.id,
        authorName: "Emma Smith",
        authorRole: "STUDENT",
        assignmentId: charlottesWeb.id,
      },
      {
        content: "Of course! Just make sure to write the summary for the chapters you've read so far.",
        authorId: parent.id,
        authorName: "Sarah Smith",
        authorRole: "PARENT",
        assignmentId: charlottesWeb.id,
      },
      {
        content: "Great work on this poster, Emma! The colors look wonderful.",
        authorId: parent.id,
        authorName: "Sarah Smith",
        authorRole: "PARENT",
        assignmentId: solarSystem.id,
      },
      {
        content: "You need to redo questions 5-8. Remember to carry the ones when adding numbers over 10.",
        authorId: parent.id,
        authorName: "Sarah Smith",
        authorRole: "PARENT",
        assignmentId: spellingTest.id,
      },
    ],
  });

  // Activity log entries
  await db.activityLog.createMany({
    data: [
      {
        action: "CREATED",
        details: 'Assignment "Chapter 5: Fractions" created',
        performedBy: parent.id,
        performedByName: "Sarah Smith",
        assignmentId: fractions.id,
      },
      {
        action: "STATUS_CHANGED",
        details: "ASSIGNED → IN_PROGRESS",
        performedBy: parent.id,
        performedByName: "Emma",
        assignmentId: charlottesWeb.id,
      },
      {
        action: "STATUS_CHANGED",
        details: "IN_PROGRESS → SUBMITTED",
        performedBy: parent.id,
        performedByName: "Liam",
        assignmentId: additionWorksheet.id,
      },
      {
        action: "STATUS_CHANGED",
        details: "SUBMITTED → COMPLETED",
        performedBy: parent.id,
        performedByName: "Sarah Smith",
        assignmentId: solarSystem.id,
      },
      {
        action: "STATUS_CHANGED",
        details: "SUBMITTED → RETURNED",
        performedBy: parent.id,
        performedByName: "Sarah Smith",
        assignmentId: spellingTest.id,
      },
      {
        action: "COMMENT_ADDED",
        details: "Comment added",
        performedBy: parent.id,
        performedByName: "Sarah Smith",
        assignmentId: solarSystem.id,
      },
    ],
  });

  // Assignment template
  await db.assignmentTemplate.create({
    data: {
      title: "Weekly Reading Journal",
      description: "Read for 30 minutes and write a journal entry about what you read. Include: main characters, setting, and your favorite part.",
      subjectId: reading.id,
      estimatedMinutes: 45,
      familyId: family.id,
    },
  });

  await db.assignmentTemplate.create({
    data: {
      title: "Math Practice Set",
      description: "Complete the practice problems for the current chapter.",
      subjectId: math.id,
      estimatedMinutes: 30,
      familyId: family.id,
    },
  });

  // Attendance logs
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

  await db.attendanceLog.createMany({
    data: [
      {
        date: yesterday,
        hoursLogged: 2.5,
        studentId: emma.id,
        subjectId: math.id,
        familyId: family.id,
        notes: "Worked on fractions and decimals",
      },
      {
        date: yesterday,
        hoursLogged: 1.5,
        studentId: emma.id,
        subjectId: reading.id,
        familyId: family.id,
        notes: "Reading Charlotte's Web",
      },
      {
        date: yesterday,
        hoursLogged: 2,
        studentId: liam.id,
        subjectId: math.id,
        familyId: family.id,
        notes: "Addition practice",
      },
      {
        date: twoDaysAgo,
        hoursLogged: 1,
        studentId: emma.id,
        subjectId: science.id,
        familyId: family.id,
        notes: "Solar system poster work",
      },
      {
        date: twoDaysAgo,
        hoursLogged: 1.5,
        studentId: liam.id,
        subjectId: reading.id,
        familyId: family.id,
        notes: "Spelling practice",
      },
      {
        date: threeDaysAgo,
        hoursLogged: 2,
        studentId: emma.id,
        subjectId: math.id,
        familyId: family.id,
      },
      {
        date: fourDaysAgo,
        hoursLogged: 1.5,
        studentId: liam.id,
        subjectId: math.id,
        familyId: family.id,
      },
    ],
  });

  // Goals
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  await db.goal.create({
    data: {
      title: "Complete 5 math assignments",
      targetCount: 5,
      currentCount: 1, // Solar system is science, fractions not completed yet — only the completed one counts if it matches
      studentId: emma.id,
      subjectId: math.id,
      familyId: family.id,
      termStart: monthStart,
      termEnd: monthEnd,
    },
  });

  await db.goal.create({
    data: {
      title: "Finish 3 reading assignments",
      targetCount: 3,
      currentCount: 0,
      studentId: liam.id,
      subjectId: reading.id,
      familyId: family.id,
      termStart: monthStart,
      termEnd: monthEnd,
    },
  });

  await db.goal.create({
    data: {
      title: "Complete 10 assignments total",
      targetCount: 10,
      currentCount: 1, // only solarSystem is COMPLETED
      studentId: emma.id,
      familyId: family.id,
      termStart: monthStart,
      termEnd: monthEnd,
    },
  });

  // Create super admin
  await db.user.create({
    data: {
      email: "admin@hsms.com",
      name: "Admin User",
      hashedPassword,
      role: "SUPER_ADMIN",
      familyId: family.id,
      onboarded: true,
    },
  });

  console.log("Seed complete!");
  console.log("  Demo parent:  parent@demo.com / password123");
  console.log("  Student Emma: emma@demo.com / password123");
  console.log("  Student Liam: liam@demo.com / password123");
  console.log("  Super admin:  admin@hsms.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
