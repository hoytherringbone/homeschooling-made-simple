"use client";

import { useState } from "react";
import { Menu, X, BookOpen, Check } from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#EDE9E3]">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-white" strokeWidth={2} />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center">
              <Check className="w-2 h-2 text-white" strokeWidth={3} />
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-900 hidden sm:block">
            Home Schooling Made Simple
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
          >
            Log In
          </a>
          <a
            href="/signup"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full px-6 py-2.5 transition-all duration-200 active:scale-[0.98]"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#EDE9E3] px-6 pb-6">
          <div className="flex flex-col gap-4 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-[#EDE9E3]" />
            <a
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full px-6 py-2.5 text-center transition-all duration-200"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
