import { ASSIGNMENT_STATUS } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  const config = ASSIGNMENT_STATUS[status as keyof typeof ASSIGNMENT_STATUS] ?? {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
