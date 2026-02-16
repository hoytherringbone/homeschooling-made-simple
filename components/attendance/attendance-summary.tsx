import { Clock, CalendarDays, Users } from "lucide-react";

interface AttendanceSummaryProps {
  totalHours: number;
  weekHours: number;
  studentHours: { name: string; hours: number }[];
}

export function AttendanceSummary({
  totalHours,
  weekHours,
  studentHours,
}: AttendanceSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
            <Clock className="w-4.5 h-4.5 text-teal-600" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            This Month
          </span>
        </div>
        <p className="text-2xl font-semibold text-slate-900">
          {totalHours.toFixed(1)}h
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-4.5 h-4.5 text-blue-600" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            This Week
          </span>
        </div>
        <p className="text-2xl font-semibold text-slate-900">
          {weekHours.toFixed(1)}h
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-amber-600" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Per Student
          </span>
        </div>
        <div className="space-y-1">
          {studentHours.length === 0 ? (
            <p className="text-sm text-slate-400">No logs yet</p>
          ) : (
            studentHours.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{s.name}</span>
                <span className="text-sm font-medium text-slate-900">
                  {s.hours.toFixed(1)}h
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
