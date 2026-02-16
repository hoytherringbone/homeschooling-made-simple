"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteAssignment } from "@/lib/actions/assignments";
import { Trash2 } from "lucide-react";

export function DeleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAssignment(assignmentId);
      if (result.error) {
        toast.error(result.error);
        setConfirming(false);
      } else {
        toast.success("Assignment deleted");
        router.push("/assignments");
      }
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Delete this assignment?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-3 py-1.5 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-full transition-colors disabled:opacity-50"
        >
          {isPending ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  );
}
