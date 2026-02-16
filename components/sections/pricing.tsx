"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "for 14 days",
    description: "Full access to everything. No credit card required.",
    features: [
      "All features included",
      "Unlimited students",
      "Unlimited assignments",
      "Progress reports & exports",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Annual",
    price: "$89.99",
    period: "/year",
    description: "Best value — save ~25% compared to monthly.",
    badge: "Best Value",
    features: [
      "Everything in Monthly",
      "Unlimited students",
      "Priority support",
      "Attendance & compliance tracking",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Monthly",
    price: "$9.99",
    period: "/month",
    description: "Full access, billed monthly. Cancel anytime.",
    features: [
      "Unlimited students",
      "Unlimited assignments",
      "Progress reports & exports",
      "Attendance & compliance tracking",
    ],
    cta: "Get Started",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-20 sm:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Simple pricing for every family.
            </h2>
            <p className="text-lg text-slate-500">
              Start free. Upgrade when you&apos;re ready. No hidden fees, no per-student charges.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-start">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <div
                className={`relative rounded-2xl p-6 sm:p-8 h-full flex flex-col ${
                  plan.highlighted
                    ? "bg-white border-2 border-teal-600 shadow-lg scale-[1.02]"
                    : "bg-white border border-[#EDE9E3]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-medium px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <p className="text-sm text-slate-500 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" strokeWidth={2.5} />
                      <span className="text-sm text-slate-600">{f}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`block text-center rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                    plan.highlighted
                      ? "bg-teal-600 hover:bg-teal-700 text-white"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-sm text-slate-400 mt-10 max-w-xl mx-auto">
            Every plan includes unlimited students, unlimited assignments, and full access to every
            feature. No per-student fees. Ever.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
