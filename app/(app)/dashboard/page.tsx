import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ParentDashboard } from "@/components/dashboards/parent-dashboard";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";
import { AdminDashboard } from "@/components/dashboards/admin-dashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role } = session.user;

  if (role === "SUPER_ADMIN") {
    return <AdminDashboard user={session.user} />;
  }

  if (role === "STUDENT") {
    return <StudentDashboard user={session.user} />;
  }

  return <ParentDashboard user={session.user} />;
}
