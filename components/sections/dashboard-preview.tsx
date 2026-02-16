"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { StudentDashboard } from "@/components/mockups/student-dashboard";

export function DashboardPreviewSection() {
  return (
    <section className="bg-white py-20 sm:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Students get their own dashboard.
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              A clean, focused view of what&apos;s on their plate. They see assignments, track
              progress, and know exactly what&apos;s due — simple enough for any age.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="max-w-4xl mx-auto">
            <StudentDashboard />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
