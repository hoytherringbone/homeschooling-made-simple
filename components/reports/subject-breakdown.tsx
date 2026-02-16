interface SubjectStat {
  name: string;
  color: string | null;
  total: number;
  completed: number;
}

export function SubjectBreakdown({ subjects }: { subjects: SubjectStat[] }) {
  if (subjects.length === 0) return null;

  return (
    <div className="space-y-3">
      {subjects.map((subject) => {
        const rate = subject.total > 0 ? Math.round((subject.completed / subject.total) * 100) : 0;
        return (
          <div key={subject.name} className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: subject.color || "#94a3b8" }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-700 truncate">
                  {subject.name}
                </span>
                <span className="text-xs text-slate-500 shrink-0 ml-2">
                  {subject.completed}/{subject.total} ({rate}%)
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${rate}%`,
                    backgroundColor: subject.color || "#94a3b8",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
