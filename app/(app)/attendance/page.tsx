import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AttendanceForm } from "@/components/attendance/attendance-form";
import { AttendanceSummary } from "@/components/attendance/attendance-summary";
import { DeleteLogButton } from "@/components/attendance/delete-log-button";

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const familyId = session.user.familyId;
  const now = new Date();

  // Current month range
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Current week start (Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const [logs, students, subjects] = await Promise.all([
    db.attendanceLog.findMany({
      where: {
        familyId,
        date: { gte: monthStart, lte: monthEnd },
      },
      include: {
        student: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    }),
    db.student.findMany({
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

  // Build subject name map
  const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

  // Summary calculations
  const totalHours = logs.reduce((sum, l) => sum + l.hoursLogged, 0);
  const weekHours = logs
    .filter((l) => new Date(l.date) >= weekStart)
    .reduce((sum, l) => sum + l.hoursLogged, 0);

  const studentHoursMap = new Map<string, { name: string; hours: number }>();
  for (const log of logs) {
    const existing = studentHoursMap.get(log.studentId);
    if (existing) {
      existing.hours += log.hoursLogged;
    } else {
      studentHoursMap.set(log.studentId, {
        name: log.student.name,
        hours: log.hoursLogged,
      });
    }
  }
  const studentHours = Array.from(studentHoursMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
        <p className="text-sm text-slate-500 mt-1">
          Log and track learning hours for each student.
        </p>
      </div>

      <AttendanceForm students={students} subjects={subjects} />

      <AttendanceSummary
        totalHours={totalHours}
        weekHours={weekHours}
        studentHours={studentHours}
      />

      {/* Log Table */}
      {logs.length > 0 ? (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EDE9E3]">
            <h2 className="text-sm font-semibold text-slate-900">
              This Month&apos;s Log ({logs.length} entries)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EDE9E3] text-left">
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Student
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Subject
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Hours
                  </th>
                  <th className="px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Notes
                  </th>
                  <th className="px-5 py-3 w-10" />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-[#EDE9E3] last:border-0"
                  >
                    <td className="px-5 py-3 text-slate-700">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-slate-900 font-medium">
                      {log.student.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {log.subjectId
                        ? subjectMap.get(log.subjectId) || "—"
                        : "General"}
                    </td>
                    <td className="px-5 py-3 text-slate-900 font-medium">
                      {log.hoursLogged}h
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-[200px] truncate">
                      {log.notes || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <DeleteLogButton logId={log.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-10 text-center">
          <p className="text-slate-400 text-sm">
            No attendance logged this month. Use the form above to start
            tracking hours.
          </p>
        </div>
      )}
    </div>
  );
}
