import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
import { getUnreadCount } from "@/lib/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const unreadCount = await getUnreadCount(
    session.user.id,
    session.user.familyId
  );

  return (
    <div className="flex h-screen bg-linen dark:bg-slate-900">
      <AppSidebar user={session.user} unreadCount={unreadCount} />
      <main className="flex-1 overflow-y-auto">
        <div className="flex justify-end px-6 lg:px-8 pt-4 pb-0 max-w-7xl">
          <DarkModeToggle />
        </div>
        <div className="px-6 lg:px-8 pb-6 lg:pb-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
