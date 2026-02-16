"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import {
  ClipboardList,
  ArrowRightLeft,
  BarChart3,
  Calendar,
  FileText,
  Users,
  type LucideIcon,
} from "lucide-react";

const features: {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    icon: ClipboardList,
    title: "Assign & Track Work",
    description:
      "Create assignments, set due dates, and assign them to your students. Track everything from one clean dashboard — no more scattered notes or forgotten tasks.",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    icon: ArrowRightLeft,
    title: "Submit, Review, Return",
    description:
      "Students mark work as done. You review it, approve it, or send it back with feedback. A simple workflow that keeps everyone on the same page.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Progress Reports in One Click",
    description:
      "See how each child is doing by subject, by week, or by semester. Export polished PDF reports for your state requirements or your own peace of mind.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    icon: Calendar,
    title: "Plan Your Week Visually",
    description:
      "A calendar view that shows what's due and when. Drag, reschedule, and plan ahead without losing your mind.",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    icon: FileText,
    title: "Compliance Made Easy",
    description:
      "Log attendance, track hours by subject, and generate the documentation your state requires. No more last-minute scrambles before reviews.",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    icon: Users,
    title: "Built for the Whole Family",
    description:
      "Parents get the full command center. Students get their own simple dashboard. Multiple kids, multiple subjects — one organized system.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-20 sm:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-14">
            <p className="text-sm font-medium text-teal-600 uppercase tracking-wide mb-4">
              Everything you need. Nothing you don&apos;t.
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              One simple place to manage your homeschool.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08}>
              <div className="bg-white border border-[#EDE9E3] rounded-2xl p-6 sm:p-8 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center mb-5`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
