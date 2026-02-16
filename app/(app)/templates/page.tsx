import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TemplatesPageClient } from "./templates-client";

export default async function TemplatesPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.familyId) redirect("/login");
  if (session.user.role === "STUDENT") redirect("/dashboard");

  const familyId = session.user.familyId;

  const [templates, subjects] = await Promise.all([
    db.assignmentTemplate.findMany({
      where: { familyId },
      include: { subject: { select: { name: true, color: true } } },
      orderBy: { title: "asc" },
    }),
    db.subject.findMany({
      where: { familyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <TemplatesPageClient
      templates={templates.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        subjectId: t.subjectId,
        estimatedMinutes: t.estimatedMinutes,
        subject: t.subject,
      }))}
      subjects={subjects}
    />
  );
}
