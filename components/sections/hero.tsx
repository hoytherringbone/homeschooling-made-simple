"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { ParentDashboard } from "@/components/mockups/parent-dashboard";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-white to-sand pt-20 pb-20 px-6 overflow-hidden">
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Warm radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-600/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-5">
            The simple way to organize your homeschool
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.1] mb-6">
            Spend less time tracking assignments.
            <br />
            Spend more time actually teaching.
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Home Schooling Made Simple gives you one calm, organized place to assign work, track
            progress, and generate the reports you need — so you can get back to what you actually
            signed up for.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a
              href="#"
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98] w-full sm:w-auto"
            >
              Start Your Free Trial
            </a>
            <a
              href="#how-it-works"
              className="bg-white border border-slate-200 text-slate-700 hover:bg-sand rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98] w-full sm:w-auto"
            >
              See How It Works
            </a>
          </div>
          <p className="text-sm text-slate-400 mb-2">Free for 14 days. No credit card required.</p>
          <p className="text-xs text-slate-400/70">Trusted by 500+ homeschool families across 38 states</p>
        </ScrollReveal>
      </div>

      {/* Dashboard mockup */}
      <ScrollReveal delay={0.4} className="relative max-w-5xl mx-auto mt-12">
        <div className="relative">
          <div className="absolute inset-0 bg-teal-600/5 rounded-3xl blur-3xl scale-105" />
          <div className="relative" style={{ transform: "perspective(2000px) rotateX(2deg)" }}>
            <ParentDashboard />
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
