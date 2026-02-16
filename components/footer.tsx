import { BookOpen, Check } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center">
                  <Check className="w-1.5 h-1.5 text-white" strokeWidth={3} />
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-300">
                Home Schooling Made Simple
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              The calm, organized way to manage your homeschool.
            </p>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Home Schooling Made Simple. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {["Features", "Pricing", "How It Works", "Log In"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {["Help Center", "Contact Us", "System Status"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
