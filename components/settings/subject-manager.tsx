"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSubject, updateSubject, deleteSubject } from "@/lib/actions/settings";
import { SUBJECT_COLORS } from "@/lib/constants";
import { Plus, Pencil, Trash2, X, Check, Settings2 } from "lucide-react";
import Link from "next/link";

interface Subject {
  id: string;
  name: string;
  color: string | null;
}

export function SubjectManager({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[0]);

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createSubject({ name: name.trim(), color });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Subject added");
        setName("");
        setShowAdd(false);
        router.refresh();
      }
    });
  };

  const handleUpdate = (id: string) => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await updateSubject({ id, name: name.trim(), color });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Subject updated");
        setEditingId(null);
        setName("");
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string, subjectName: string) => {
    if (!confirm(`Delete "${subjectName}"?`)) return;
    startTransition(async () => {
      const result = await deleteSubject(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Subject deleted");
        router.refresh();
      }
    });
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setName(subject.name);
    setColor(subject.color || SUBJECT_COLORS[0]);
    setShowAdd(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAdd(false);
    setName("");
    setColor(SUBJECT_COLORS[0]);
  };

  const inputClass =
    "flex-1 rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";

  return (
    <div className="space-y-3">
      {subjects.map((subject) => (
        <div key={subject.id} className="flex items-center gap-3">
          {editingId === subject.id ? (
            <>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-[#EDE9E3] cursor-pointer"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleUpdate(subject.id);
                  if (e.key === "Escape") cancelEdit();
                }}
              />
              <button
                onClick={() => handleUpdate(subject.id)}
                disabled={isPending}
                className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={cancelEdit}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <span
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: subject.color || "#94a3b8" }}
              />
              <span className="flex-1 text-sm text-slate-900">{subject.name}</span>
              <Link
                href={`/subjects/${subject.id}`}
                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Configure weights"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => startEdit(subject)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(subject.id, subject.name)}
                disabled={isPending}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ))}

      {showAdd ? (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded-lg border border-[#EDE9E3] cursor-pointer"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subject name"
            className={inputClass}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") cancelEdit();
            }}
          />
          <button
            onClick={handleAdd}
            disabled={isPending || !name.trim()}
            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={cancelEdit}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
            setName("");
            setColor(SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length]);
          }}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      )}
    </div>
  );
}
