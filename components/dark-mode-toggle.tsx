"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="w-5 h-5" strokeWidth={1.75} /> : <Moon className="w-5 h-5" strokeWidth={1.75} />}
    </button>
  );
}
