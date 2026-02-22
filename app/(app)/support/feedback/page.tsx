import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScnGWMZC65bAgGQJUtkQk7AknIuSBg5s37ZCWkUfC5ZjG7B9g/viewform?embedded=true";

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/support"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Support
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Give Feedback
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Share your thoughts, report an issue, or suggest a feature.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 p-6">
        <iframe
          src={GOOGLE_FORM_URL}
          width="100%"
          height="1303"
          className="border-0"
          title="Feedback Form"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
}
