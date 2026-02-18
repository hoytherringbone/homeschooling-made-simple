import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface AdminAssignmentsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminAssignmentsPage({
  searchParams,
}: AdminAssignmentsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const params = await searchParams;
  const statusParam = params.status ? String(params.status) : "";
  const statusFilters = statusParam
    ? statusParam.split(",").map((s) => s.trim().toUpperCase())
    : [];

  const assignments = await db.assignment.findMany({
    include: {
      student: { select: { name: true } },
      subject: { select: { name: true } },
      family: { select: { name: true } },
    },
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
  });

  const filteredAssignments =
    statusFilters.length > 0
      ? assignments.filter((a) => statusFilters.includes(a.status))
      : assignments;

  const statusOptions = [
    { value: "ALL", label: "All" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const isActiveFilter = (value: string) => {
    if (value === "ALL") return statusFilters.length === 0;
    return statusFilters.includes(value);
  };

  const getFilterUrl = (value: string) => {
    if (value === "ALL") return "/admin/assignments";
    return `/admin/assignments?status=${value}`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <PageHeader
        title="All Assignments"
        description={`${filteredAssignments.length} assignment${filteredAssignments.length !== 1 ? "s" : ""}`}
      />

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusOptions.map((option) => (
          <Link
            key={option.value}
            href={getFilterUrl(option.value)}
            className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              isActiveFilter(option.value)
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-2xl border border-[#EDE9E3] overflow-hidden">
        <div className="divide-y divide-[#EDE9E3]">
          {filteredAssignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-slate-900">{assignment.title}</p>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                  <span>{assignment.student.name}</span>
                  <span>·</span>
                  <span>{assignment.subject?.name || "No subject"}</span>
                  <span>·</span>
                  <span>{assignment.family.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <StatusBadge status={assignment.status} />
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(assignment.dueDate)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
          {filteredAssignments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">
              No assignments found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
