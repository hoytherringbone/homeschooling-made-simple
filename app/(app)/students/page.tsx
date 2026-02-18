import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Users, ClipboardList, CheckCircle2 } from "lucide-react";

export default async function StudentsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const familyId = session.user.familyId;

  const students = await db.student.findMany({
    where: { familyId },
    include: {
      assignments: {
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Students</h1>
        <p className="text-sm text-slate-500 mt-1">
          {students.length} student{students.length !== 1 ? "s" : ""} in your
          family
        </p>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            No students yet
          </h3>
          <p className="text-sm text-slate-500">
            Add students during onboarding to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const total = student.assignments.length;
            const completed = student.assignments.filter(
              (a) => a.status === "COMPLETED"
            ).length;
            const inProgress = student.assignments.filter(
              (a) => a.status === "ASSIGNED"
            ).length;
            const completionRate =
              total > 0 ? Math.round((completed / total) * 100) : 0;

            const initials = student.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link key={student.id} href={`/students/${student.id}`}>
                <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5 hover:shadow-sm hover:border-teal-200 transition-all duration-200 cursor-pointer space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {initials}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {student.name}
                      </h3>
                      {student.gradeLevel && (
                        <p className="text-xs text-slate-500">
                          {student.gradeLevel} Grade
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl py-2">
                      <p className="text-lg font-bold text-slate-900">
                        {total}
                      </p>
                      <p className="text-[10px] text-slate-500">Total</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl py-2">
                      <p className="text-lg font-bold text-blue-700">
                        {inProgress}
                      </p>
                      <p className="text-[10px] text-blue-600">Active</p>
                    </div>
                    <div className="bg-green-50 rounded-xl py-2">
                      <p className="text-lg font-bold text-green-700">
                        {completed}
                      </p>
                      <p className="text-[10px] text-green-600">Done</p>
                    </div>
                  </div>

                  {total > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">
                          Completion
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {completionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-600 rounded-full transition-all"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
