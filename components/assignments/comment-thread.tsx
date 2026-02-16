interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: Date;
}

interface CommentThreadProps {
  comments: Comment[];
}

export function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4">No comments yet.</p>
    );
  }

  return (
    <div className="space-y-0">
      {comments.map((comment, i) => {
        const isParent = comment.authorRole === "PARENT" || comment.authorRole === "SUPER_ADMIN";
        const initials = comment.authorName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div key={comment.id} className="flex gap-3 relative">
            {/* Vertical connecting line */}
            {i < comments.length - 1 && (
              <div className="absolute left-[15px] top-[36px] bottom-0 w-px bg-slate-200" />
            )}

            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                isParent
                  ? "bg-teal-50 text-teal-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {initials}
            </div>

            {/* Content */}
            <div className="flex-1 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">
                  {comment.authorName}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isParent
                      ? "bg-teal-50 text-teal-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {isParent ? "Parent" : "Student"}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
