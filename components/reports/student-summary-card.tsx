import Link from "next/link";

interface StudentSummaryProps {
  student: {
    id: string;
    name: string;
    gradeLevel: string | null;
  };
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export function StudentSummaryCard({
  student,
  total,
  completed,
  inProgress,
  overdue,
}: StudentSummaryProps) {
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link href={`/students/${student.id}`}>
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5 hover:shadow-sm hover:border-teal-200 transition-all duration-200 cursor-pointer space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {student.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">{student.name}</p>
            {student.gradeLevel && (
              <p className="text-xs text-slate-500">{student.gradeLevel} Grade</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-slate-50 rounded-xl py-1.5">
            <p className="text-base font-bold text-slate-900">{total}</p>
            <p className="text-[10px] text-slate-500">Total</p>
          </div>
          <div className="bg-blue-50 rounded-xl py-1.5">
            <p className="text-base font-bold text-blue-700">{inProgress}</p>
            <p className="text-[10px] text-blue-600">Active</p>
          </div>
          <div className="bg-green-50 rounded-xl py-1.5">
            <p className="text-base font-bold text-green-700">{completed}</p>
            <p className="text-[10px] text-green-600">Done</p>
          </div>
          <div className={`rounded-xl py-1.5 ${overdue > 0 ? "bg-rose-50" : "bg-slate-50"}`}>
            <p className={`text-base font-bold ${overdue > 0 ? "text-rose-700" : "text-slate-400"}`}>
              {overdue}
            </p>
            <p className={`text-[10px] ${overdue > 0 ? "text-rose-600" : "text-slate-400"}`}>
              Overdue
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Completion</span>
            <span className="text-xs font-medium text-slate-700">{rate}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all"
              style={{ width: `${rate}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
