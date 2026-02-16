"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import { Clock, FolderSearch, ShieldAlert } from "lucide-react";

const painPoints = [
  {
    icon: Clock,
    title: "The planning never ends",
    description:
      "You're spending Sunday nights updating spreadsheets, planning lessons, and logging hours. The admin work has quietly taken over your homeschool.",
    borderColor: "border-l-amber-500",
  },
  {
    icon: FolderSearch,
    title: "Records are scattered everywhere",
    description:
      "You're digging through folders trying to remember if your daughter finished that science unit. Notes in one place, grades in another, nothing connected.",
    borderColor: "border-l-teal-600",
  },
  {
    icon: ShieldAlert,
    title: "Compliance feels like a gamble",
    description:
      "You're second-guessing whether you're keeping good enough records. When state review time comes, the scramble to pull documentation together is stressful.",
    borderColor: "border-l-rose-500",
  },
];

export function ProblemSection() {
  return (
    <section className="relative bg-sand py-20 sm:py-24 px-6 overflow-hidden">
      {/* Soft radial warmth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="relative max-w-4xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-center mb-12">
            You didn&apos;t start homeschooling to become a spreadsheet manager.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {painPoints.map((point, i) => (
            <ScrollReveal key={point.title} delay={i * 0.1}>
              <div
                className={`bg-white rounded-xl p-6 border border-[#EDE9E3] border-l-4 ${point.borderColor} h-full`}
              >
                <point.icon
                  className="w-5 h-5 text-slate-400 mb-3"
                  strokeWidth={1.75}
                />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{point.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{point.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.4}>
          <p className="text-center text-lg text-slate-600 mt-10 max-w-2xl mx-auto leading-relaxed">
            It shouldn&apos;t be this hard. You deserve a tool that handles the tracking so you can
            focus on the teaching.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
