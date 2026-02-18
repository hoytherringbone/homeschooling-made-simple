"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  BarChart3,
  FileText,
  CheckSquare,
  Target,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  GraduationCap,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useState } from "react";

const parentNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Assignments", href: "/assignments", icon: ClipboardList },
  { label: "Students", href: "/students", icon: Users },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "Attendance", href: "/attendance", icon: CheckSquare },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

const adminNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Families", href: "/admin/families", icon: Home },
  { label: "Parents", href: "/admin/parents", icon: Users },
  { label: "Students", href: "/admin/students", icon: GraduationCap },
  { label: "Assignments", href: "/admin/assignments", icon: ClipboardList },
  { label: "Settings", href: "/settings", icon: Settings },
];

const studentNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Work", href: "/assignments", icon: ClipboardList },
  { label: "Progress", href: "/progress", icon: BarChart3 },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

interface AppSidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role: string;
    familyId: string;
  };
  unreadCount: number;
}

export function AppSidebar({ user, unreadCount }: AppSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems =
    user.role === "SUPER_ADMIN"
      ? adminNav
      : user.role === "STUDENT"
        ? studentNav
        : parentNav;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-[#EDE9E3] dark:border-slate-700">
        <Logo size="sm" href="/dashboard" shortText />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive(item.href)
                ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-l-2 border-teal-600 ml-0"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <item.icon className="w-4.5 h-4.5" strokeWidth={1.75} />
            {item.label}
            {item.href === "/notifications" && unreadCount > 0 && (
              <span className="ml-auto min-w-5 h-5 bg-teal-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#EDE9E3] dark:border-slate-700 p-4 space-y-2">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-white">
              {user.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {user.role.toLowerCase().replace("_", " ")}
            </p>
          </div>
        </div>

        {user.role !== "STUDENT" && (
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" strokeWidth={1.75} />
            Settings
          </Link>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30 dark:hover:text-rose-400 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-800 border-b border-[#EDE9E3] dark:border-slate-700 flex items-center px-4 z-40">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-slate-600" />
          ) : (
            <Menu className="w-5 h-5 text-slate-600" />
          )}
        </button>
        <div className="ml-3">
          <Logo size="sm" shortText />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`lg:hidden fixed top-14 left-0 bottom-0 w-64 bg-white dark:bg-slate-800 z-50 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 bg-white dark:bg-slate-800 border-r border-[#EDE9E3] dark:border-slate-700 shrink-0">
        {sidebar}
      </div>

      {/* Mobile spacer */}
      <div className="lg:hidden h-14" />
    </>
  );
}
