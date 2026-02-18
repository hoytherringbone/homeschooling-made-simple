import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SubjectWeightsForm } from "@/components/subjects/subject-weights-form";
import { ASSIGNMENT_CATEGORIES } from "@/lib/constants";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SubjectDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role !== "PARENT" && session.user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const { id } = await params;
  const familyId = session.user.familyId;

  const subject = await db.subject.findFirst({
    where: { id, familyId },
    include: {
      weights: true,
      assignments: {
        select: {
          id: true,
          title: true,
          status: true,
          category: true,
          gradeLabel: true,
          gradeValue: true,
          student: { select: { name: true } },
          dueDate: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!subject) notFound();

  const categoryLabels = Object.fromEntries(ASSIGNMENT_CATEGORIES.map((c) => [c.value, c.label]));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/settings"
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div className="flex items-center gap-2.5">
          <span
            className="w-4 h-4 rounded-full shrink-0"
            style={{ backgroundColor: subject.color || "#94a3b8" }}
          />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{subject.name}</h1>
        </div>
      </div>

      {/* Weights Configuration */}
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Category Weights</h2>
          <p className="text-sm text-slate-500 mt-1">
            Set how much each assignment type counts toward the weighted GPA. Weights must total 100%.
          </p>
        </div>
        <SubjectWeightsForm
          subjectId={subject.id}
          existingWeights={subject.weights.map((w) => ({ category: w.category, weight: w.weight }))}
        />
      </div>

      {/* Assignments for this subject */}
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Assignments</h2>
        {subject.assignments.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No assignments yet for this subject.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {subject.assignments.map((a) => (
              <Link
                key={a.id}
                href={`/assignments/${a.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.title}</p>
                    <p className="text-xs text-slate-500">{a.student.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {a.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {categoryLabels[a.category] || a.category}
                    </span>
                  )}
                  {a.gradeLabel && (
                    <span className="text-xs font-medium text-teal-600">{a.gradeLabel}</span>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      a.status === "COMPLETED"
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a.status === "COMPLETED" ? "Completed" : "Assigned"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
