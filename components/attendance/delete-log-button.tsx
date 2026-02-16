"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAttendanceLog } from "@/lib/actions/attendance";
import { Trash2 } from "lucide-react";

export function DeleteLogButton({ logId }: { logId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await deleteAttendanceLog(logId);
          router.refresh();
        });
      }}
      disabled={isPending}
      className="text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
