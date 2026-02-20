const ACTION_MAP: Record<string, string> = {
  CREATED: "created an assignment",
  UPDATED: "updated an assignment",
  STATUS_CHANGED: "changed status",
  COMMENT_ADDED: "added a comment",
};

function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface ActivityEntry {
  id: string;
  action: string;
  details: string | null;
  performedByName: string;
  createdAt: Date;
  assignment?: {
    id: string;
    title: string;
  } | null;
}

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 p-10 text-center">
        <p className="text-sm text-slate-400 dark:text-slate-500">No activity found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 divide-y divide-[#EDE9E3] dark:divide-slate-700">
      {entries.map((entry) => {
        const initial = entry.performedByName.charAt(0).toUpperCase();
        const actionText = ACTION_MAP[entry.action] || entry.action.toLowerCase();
        const statusDetail =
          entry.action === "STATUS_CHANGED" && entry.details
            ? ` (${entry.details})`
            : "";

        return (
          <div key={entry.id} className="flex items-start gap-3 px-5 py-4">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-xs font-semibold text-white">{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 dark:text-slate-100">
                <span className="font-medium">{entry.performedByName}</span>
                {" "}
                <span className="text-slate-500 dark:text-slate-400">
                  {actionText}{statusDetail}
                </span>
              </p>
              {entry.assignment && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {entry.assignment.title}
                </p>
              )}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
              {timeAgo(entry.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
