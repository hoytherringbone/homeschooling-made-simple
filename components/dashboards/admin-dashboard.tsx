import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Home,
  TrendingUp,
  ChevronRight,
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
      href: "/admin/families",
    },
    {
      label: "Parents",
      value: parentUsers.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/parents",
    },
    {
      label: "Students",
      value: allStudents.length,
      icon: GraduationCap,
      color: "text-violet-600",
      bg: "bg-violet-50",
      href: "/admin/students",
    },
    {
      label: "Total Assignments",
      value: allAssignments.length,
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/assignments",
    },
    {
      label: "Completed",
      value: completedAssignments.length,
      icon: ClipboardCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/admin/assignments?status=COMPLETED",
    },
    {
      label: "Active",
      value: activeAssignments.length,
      icon: TrendingUp,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/admin/assignments?status=ASSIGNED,IN_PROGRESS,SUBMITTED,RETURNED",
    },
  ];

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        description="Platform administration overview"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => {
          const content = (
            <div
              className={`bg-white rounded-2xl border border-[#EDE9E3] p-4 ${stat.href ? "hover:border-teal-200 hover:shadow-sm transition-all cursor-pointer" : ""}`}
            >
              <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.label}>{content}</div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Families</h2>
            <Link href="/admin/families" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {families
              .filter((f) => f.name !== "HSMS Administration")
              .map((family) => (
                <Link
                  key={family.id}
                  href={`/admin/families/${family.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-slate-900">{family.name}</p>
                    <p className="text-xs text-slate-500">
                      {family._count.users} user{family._count.users !== 1 ? "s" : ""} · {family._count.students} student{family._count.students !== 1 ? "s" : ""} · {family._count.assignments} assignment{family._count.assignments !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Link>
              ))}
            {families.filter((f) => f.name !== "HSMS Administration").length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No families registered yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Parents</h2>
            <Link href="/admin/parents" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parentUsers.map((parent) => (
              <Link
                key={parent.id}
                href={`/admin/parents/${parent.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-slate-900">{parent.name}</p>
                  <p className="text-xs text-slate-500">{parent.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{parent.family.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
            ))}
            {parentUsers.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No parents registered yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">All Students</h2>
            <Link href="/admin/students" className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {allStudents.map((student) => (
              <Link
                key={student.id}
                href={`/admin/students/${student.id}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">
                    {student.gradeLevel || "No grade"} · {student.family.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {student._count.assignments} assignment{student._count.assignments !== 1 ? "s" : ""}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
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
