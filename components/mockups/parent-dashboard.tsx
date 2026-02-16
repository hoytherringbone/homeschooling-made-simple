import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  Calendar,
  Bell,
  Search,
  ChevronRight,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ClipboardList, label: "Assignments", active: false },
  { icon: Users, label: "Students", active: false },
  { icon: Calendar, label: "Calendar", active: false },
  { icon: BarChart3, label: "Reports", active: false },
];

const assignments = [
  {
    title: "Chapter 5 Reading — American History",
    student: "Emma",
    subject: "History",
    subjectColor: "bg-purple-100 text-purple-700",
    status: "Completed",
    statusColor: "bg-teal-50 text-teal-700",
  },
  {
    title: "Fractions Worksheet #12",
    student: "Emma",
    subject: "Math",
    subjectColor: "bg-blue-100 text-blue-700",
    status: "In Progress",
    statusColor: "bg-amber-50 text-amber-700",
  },
  {
    title: "Spelling List — Week 8",
    student: "Noah",
    subject: "Language Arts",
    subjectColor: "bg-rose-100 text-rose-700",
    status: "Overdue",
    statusColor: "bg-red-50 text-red-600",
  },
  {
    title: "Science Lab Report — Plant Growth",
    student: "Noah",
    subject: "Science",
    subjectColor: "bg-green-100 text-green-700",
    status: "Completed",
    statusColor: "bg-teal-50 text-teal-700",
  },
  {
    title: "Drawing Exercise — Perspective",
    student: "Emma",
    subject: "Art",
    subjectColor: "bg-orange-100 text-orange-700",
    status: "Not Started",
    statusColor: "bg-slate-100 text-slate-500",
  },
];

const stats = [
  { label: "Due Today", value: "4", detail: "assignments" },
  { label: "Completed", value: "12", detail: "this week" },
  { label: "Students", value: "2", detail: "active" },
];

export function ParentDashboard() {
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
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  item.active
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <item.icon className="w-4 h-4" strokeWidth={1.75} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">Good morning, Sarah</p>
              <p className="text-[11px] text-slate-400">Monday, February 14</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="relative w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              </div>
              <div className="w-7 h-7 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-semibold text-teal-700">SM</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 px-5 py-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-xl px-3.5 py-3">
                <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
                <p className="text-[10px] text-slate-500">
                  {stat.label} <span className="text-slate-400">· {stat.detail}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Assignment list */}
          <div className="px-5 flex-1 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-900">Recent Assignments</p>
              <span className="text-[10px] text-teal-600 font-medium flex items-center gap-0.5 cursor-pointer">
                View all <ChevronRight className="w-3 h-3" />
              </span>
            </div>
            <div className="space-y-2">
              {assignments.map((a) => (
                <div
                  key={a.title}
                  className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-slate-800 truncate">{a.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{a.student}</span>
                      <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${a.subjectColor}`}>
                        {a.subject}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-medium px-2.5 py-1 rounded-full shrink-0 ${a.statusColor}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
