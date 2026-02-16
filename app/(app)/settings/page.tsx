import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FamilySettings } from "@/components/settings/family-settings";
import { SubjectManager } from "@/components/settings/subject-manager";
import { StudentManager } from "@/components/settings/student-manager";
import { Palette, Users, Home } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const familyId = session.user.familyId;

  const [family, subjects, students] = await Promise.all([
    db.family.findUnique({ where: { id: familyId }, select: { name: true } }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
    db.student.findMany({
      where: { familyId },
      select: { id: true, name: true, gradeLevel: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!family) redirect("/login");

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your family, subjects, and students.
        </p>
      </div>

      {/* Family Info */}
      <section className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Home className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Family</h2>
        </div>
        <FamilySettings familyName={family.name} />
      </section>

      {/* Subjects */}
      <section className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Subjects</h2>
        </div>
        <SubjectManager subjects={subjects} />
      </section>

      {/* Students */}
      <section className="bg-white rounded-2xl border border-[#EDE9E3] p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900">Students</h2>
        </div>
        <StudentManager students={students} />
      </section>
    </div>
  );
}
