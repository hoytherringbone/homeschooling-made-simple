"use client";

import { ScrollReveal } from "@/components/scroll-reveal";

const steps = [
  {
    number: "01",
    title: "Sign up and add your students",
    description:
      "Create your family account, add your kids, and set up your subjects. The whole thing takes less than two minutes.",
  },
  {
    number: "02",
    title: "Assign work and track progress",
    description:
      "Create assignments from scratch or from reusable templates. Your students see their work, update their progress, and submit when done.",
  },
  {
    number: "03",
    title: "Review, report, and relax",
    description:
      "Approve completed work, leave feedback, and generate progress reports whenever you need them. Your records stay organized without any extra effort.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-sand py-20 sm:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-center mb-16">
            Up and running in under two minutes.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px border-t-2 border-dashed border-slate-200" />

          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <div className="text-center relative">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-sm mb-6 relative z-10">
                  <span className="text-4xl font-semibold text-teal-600">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-14">
            <a
              href="#"
              className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-8 py-3.5 text-base font-medium transition-all duration-200 active:scale-[0.98] inline-block"
            >
              Start Your Free Trial
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
