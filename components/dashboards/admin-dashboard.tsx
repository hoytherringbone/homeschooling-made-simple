import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Home,
  TrendingUp,
} from "lucide-react";

interface AdminDashboardProps {
  user: {
    id: string;
    name?: string | null;
    role: string;
  };
}

export async function AdminDashboard({ user }: AdminDashboardProps) {
  const [families, allUsers, allStudents, allAssignments] = await Promise.all([
    db.family.findMany({
      include: {
        _count: { select: { users: true, students: true, assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: { role: { not: "SUPER_ADMIN" } },
      include: { family: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.student.findMany({
      include: {
        family: { select: { name: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.assignment.findMany({
      select: { status: true, createdAt: true },
    }),
  ]);

  const parentUsers = allUsers.filter((u) => u.role === "PARENT");

  const completedAssignments = allAssignments.filter(
    (a) => a.status === "COMPLETED",
  );
  const activeAssignments = allAssignments.filter(
    (a) => a.status !== "COMPLETED",
  );

  const firstName = user.name?.split(" ")[0] || "Admin";

  const stats = [
    {
      label: "Families",
      value: families.filter((f) => f.name !== "HSMS Administration").length,
      icon: Home,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Parents",
      value: parentUsers.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Students",
      value: allStudents.length,
      icon: GraduationCap,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Total Assignments",
      value: allAssignments.length,
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Completed",
      value: completedAssignments.length,
      icon: ClipboardCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Active",
      value: activeAssignments.length,
      icon: TrendingUp,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Platform administration overview"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-[#EDE9E3] p-4"
          >
            <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Families</h2>
            <span className="text-xs text-slate-400">{families.filter((f) => f.name !== "HSMS Administration").length} total</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {families
              .filter((f) => f.name !== "HSMS Administration")
              .map((family) => (
                <div
                  key={family.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-slate-900">{family.name}</p>
                    <p className="text-xs text-slate-500">
                      {family._count.users} user{family._count.users !== 1 ? "s" : ""} · {family._count.students} student{family._count.students !== 1 ? "s" : ""} · {family._count.assignments} assignment{family._count.assignments !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      family.subscriptionStatus === "active"
                        ? "bg-emerald-50 text-emerald-700"
                        : family.subscriptionStatus === "trial"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {family.subscriptionStatus}
                  </span>
                </div>
              ))}
            {families.filter((f) => f.name !== "HSMS Administration").length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No families registered yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Parents</h2>
            <span className="text-xs text-slate-400">{parentUsers.length} total</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parentUsers.map((parent) => (
              <div
                key={parent.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{parent.name}</p>
                  <p className="text-xs text-slate-500">{parent.email}</p>
                </div>
                <span className="text-xs text-slate-400">{parent.family.name}</span>
              </div>
            ))}
            {parentUsers.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No parents registered yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Students</h2>
            <span className="text-xs text-slate-400">{allStudents.length} total</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {allStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">
                    {student.gradeLevel || "No grade"} · {student.family.name}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {student._count.assignments} assignment{student._count.assignments !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
            {allStudents.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4 col-span-full">No students registered yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
