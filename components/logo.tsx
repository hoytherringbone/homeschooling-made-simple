import { BookOpen, Check } from "lucide-react";
import Link from "next/link";

const sizes = {
  sm: { container: "w-6 h-6", book: "w-3 h-3", check: "w-2.5 h-2.5", checkIcon: "w-1.5 h-1.5", text: "text-sm" },
  md: { container: "w-7 h-7", book: "w-3.5 h-3.5", check: "w-3 h-3", checkIcon: "w-1.5 h-1.5", text: "text-sm" },
  lg: { container: "w-9 h-9", book: "w-4.5 h-4.5", check: "w-3.5 h-3.5", checkIcon: "w-2 h-2", text: "text-base" },
};

export function Logo({
  size = "md",
  showText = true,
  shortText = false,
  href,
}: {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  shortText?: boolean;
  href?: string;
}) {
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${s.container} bg-teal-600 rounded-lg flex items-center justify-center`}>
        <BookOpen className={`${s.book} text-white`} strokeWidth={2} />
        <div className={`absolute -bottom-0.5 -right-0.5 ${s.check} bg-amber-500 rounded-full flex items-center justify-center`}>
          <Check className={`${s.checkIcon} text-white`} strokeWidth={3} />
        </div>
      </div>
      {showText && (
        <span className={`${s.text} font-semibold text-slate-900`}>
          {shortText ? "HSMS" : "Home Schooling Made Simple"}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
