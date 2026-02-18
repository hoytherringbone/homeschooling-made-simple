"use client";

import { ScrollReveal } from "@/components/scroll-reveal";

export function FinalCTASection() {
  return (
    <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-20 sm:py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-6">
            Your time belongs in the classroom, not in a spreadsheet.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-lg text-teal-100 mb-10 max-w-2xl mx-auto">
            Join families across the country who traded chaos for clarity. Start your free trial
            today and see how simple homeschooling can be.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <a
            href="/signup"
            className="inline-block bg-white text-teal-700 hover:bg-teal-50 rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98]"
          >
            Start Your Free Trial — It&apos;s Free for 14 Days
          </a>
          <p className="text-sm text-teal-200 mt-5">
            No credit card required. Set up in under 2 minutes.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
