"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addComment } from "@/lib/actions/assignments";
import { Send } from "lucide-react";

interface CommentFormProps {
  assignmentId: string;
}

export function CommentForm({ assignmentId }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addComment({ assignmentId, content: content.trim() });
      if (result.error) {
        toast.error(result.error);
      } else {
        setContent("");
        toast.success("Comment added");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        rows={2}
        className="flex-1 rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all resize-none"
      />
      <button
        type="submit"
        disabled={isPending || !content.trim()}
        className="self-end px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
