"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteFamily } from "@/lib/actions/families";

export function DeleteFamilyButton({ familyId, familyName }: { familyId: string; familyName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${familyName}"?\n\nThis will permanently remove the family and ALL of its data including users, students, assignments, and grades. This cannot be undone.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteFamily(familyId);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? "Deleting..." : "Delete Family"}
    </button>
  );
}
