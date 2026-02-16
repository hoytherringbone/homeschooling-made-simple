import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CalendarHeader } from "@/components/calendar/calendar-header";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { AssignmentFilters } from "@/components/assignments/assignment-filters";
import { getCalendarDays, formatDateKey } from "@/lib/utils/calendar";

interface PageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
    student?: string;
    subject?: string;
  }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");

  const params = await searchParams;
  const familyId = session.user.familyId;
  const isStudent = session.user.role === "STUDENT";

  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) - 1 : now.getMonth(); // Convert to 0-indexed

  // Month boundaries for the query
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0, 23, 59, 59);

  // Build where clause
  const where: Record<string, unknown> = {
    familyId,
    dueDate: { gte: monthStart, lte: monthEnd },
  };

  if (isStudent) {
    const studentProfile = await db.student.findFirst({
      where: { userId: session.user.id, familyId },
      select: { id: true },
    });
    if (!studentProfile) redirect("/dashboard");
    where.studentId = studentProfile.id;
  } else if (params.student) {
    where.studentId = params.student;
  }

  if (params.subject) {
    where.subjectId = params.subject;
  }

  const [assignments, students, subjects] = await Promise.all([
    db.assignment.findMany({
      where,
      select: {
        id: true,
        title: true,
        status: true,
        dueDate: true,
        subject: { select: { name: true, color: true } },
      },
      orderBy: { title: "asc" },
    }),
    isStudent
      ? Promise.resolve([])
      : db.student.findMany({
          where: { familyId },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Group assignments by date key
  const assignmentsByDate: Record<string, typeof assignments> = {};
  for (const a of assignments) {
    if (!a.dueDate) continue;
    const key = formatDateKey(a.dueDate);
    if (!assignmentsByDate[key]) assignmentsByDate[key] = [];
    assignmentsByDate[key].push(a);
  }

  const days = getCalendarDays(year, month);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CalendarHeader year={year} month={month} />
        <AssignmentFilters
          students={students.map((s) => ({ value: s.id, label: s.name }))}
          subjects={subjects.map((s) => ({ value: s.id, label: s.name }))}
          showStudentFilter={!isStudent}
          showStatusFilter={false}
        />
      </div>

      <CalendarGrid
        days={days}
        assignmentsByDate={assignmentsByDate}
        today={now}
      />
    </div>
  );
}
