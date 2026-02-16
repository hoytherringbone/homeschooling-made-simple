"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateFamilyName } from "@/lib/actions/settings";

export function FamilySettings({ familyName }: { familyName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(familyName);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === familyName) return;

    startTransition(async () => {
      const result = await updateFamilyName({ name: name.trim() });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Family name updated");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Family Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
        />
      </div>
      {name.trim() !== familyName && (
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      )}
    </form>
  );
}
