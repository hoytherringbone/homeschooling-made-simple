import { BookOpen, Clock, CheckCircle2, Circle, ChevronRight } from "lucide-react";

const todayAssignments = [
  {
    title: "Chapter 5 Reading — American History",
    subject: "History",
    subjectColor: "bg-purple-100 text-purple-700",
    due: "Due today",
    done: true,
  },
  {
    title: "Fractions Worksheet #12",
    subject: "Math",
    subjectColor: "bg-blue-100 text-blue-700",
    due: "Due today",
    done: false,
  },
  {
    title: "Spelling List — Week 8",
    subject: "Language Arts",
    subjectColor: "bg-rose-100 text-rose-700",
    due: "Due today",
    done: false,
  },
  {
    title: "Drawing Exercise — Perspective",
    subject: "Art",
    subjectColor: "bg-orange-100 text-orange-700",
    due: "Due tomorrow",
    done: false,
  },
];

export function StudentDashboard() {
  const completedCount = todayAssignments.filter((a) => a.done).length;
  const totalCount = todayAssignments.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden border border-slate-100 w-full max-w-4xl mx-auto">
      <div className="flex h-[420px] sm:h-[480px]">
        {/* Sidebar */}
        <div className="hidden sm:flex w-48 bg-slate-50 border-r border-slate-100 flex-col py-5 px-3 shrink-0">
          <div className="flex items-center gap-2 px-3 mb-6">
            <div className="w-6 h-6 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-[10px] font-semibold">HS</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">Made Simple</span>
          </div>
          <div className="space-y-0.5">
            {[
              { icon: BookOpen, label: "My Work", active: true },
              { icon: Clock, label: "Upcoming", active: false },
              { icon: CheckCircle2, label: "Completed", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  item.active
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.75} />
                {item.label}
              </div>
            ))}
          </div>

          {/* Progress ring */}
          <div className="mt-auto px-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-center mb-3">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#F1F5F9"
                      strokeWidth="5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="#0D9488"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={`${progress * 1.76} 176`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold text-slate-900">
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 text-center">Today&apos;s Progress</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">Hi, Emma!</p>
              <p className="text-[11px] text-slate-400">You have {totalCount - completedCount} assignments left today</p>
            </div>
            <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-semibold text-purple-700">EM</span>
            </div>
          </div>

          {/* Mobile progress bar */}
          <div className="sm:hidden px-5 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-slate-500">Today&apos;s progress</span>
              <span className="text-[10px] font-medium text-teal-600">{completedCount}/{totalCount}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Assignment list */}
          <div className="px-5 pt-4 flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-900">Today&apos;s Assignments</p>
              <span className="text-[10px] text-teal-600 font-medium flex items-center gap-0.5 cursor-pointer">
                See all <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="space-y-2">
              {todayAssignments.map((a) => (
                <div
                  key={a.title}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors ${
                    a.done ? "bg-slate-50/50" : "hover:bg-slate-50"
                  }`}
                >
                  {a.done ? (
                    <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" strokeWidth={1.75} />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 shrink-0" strokeWidth={1.75} />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[11px] font-medium truncate ${
                        a.done ? "text-slate-400 line-through" : "text-slate-800"
                      }`}
                    >
                      {a.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${a.subjectColor}`}>
                        {a.subject}
                      </span>
                      <span className="text-[10px] text-slate-400">{a.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
