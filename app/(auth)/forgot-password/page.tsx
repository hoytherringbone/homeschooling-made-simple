import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EDE9E3] p-8 text-center">
      <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <Mail className="w-6 h-6 text-teal-600" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-2">
        Reset your password
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Password reset is coming soon. For now, please contact us at{" "}
        <a
          href="mailto:support@homeschoolingmadesimple.com"
          className="text-teal-600 hover:underline"
        >
          support@homeschoolingmadesimple.com
        </a>{" "}
        and we&apos;ll help you get back in.
      </p>
      <Link
        href="/login"
        className="text-sm text-teal-600 font-medium hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}
