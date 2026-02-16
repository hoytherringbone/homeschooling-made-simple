"use client";

import Image from "next/image";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I used to spend hours every Sunday planning and tracking our week. Now I do it in ten minutes. This app gave me my weekends back.",
    name: "Sarah M.",
    detail: "Homeschooling mom of 3 — Texas",
    avatar: "/images/avatar-sarah.jpg",
  },
  {
    quote:
      "My kids actually like checking off their assignments. The student dashboard made them more independent, and I'm not constantly reminding them what's due.",
    name: "David R.",
    detail: "Homeschooling dad of 2 — Ohio",
    avatar: "/images/avatar-david.jpg",
  },
  {
    quote:
      "When our state review came up, I exported a full progress report in one click. No scrambling, no stress. That alone is worth the subscription.",
    name: "Jessica L.",
    detail: "Homeschooling mom of 4 — North Carolina",
    avatar: "/images/avatar-jessica.jpg",
  },
];

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-3">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" strokeWidth={0} />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="bg-sand py-20 sm:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-center mb-14">
            Families are finding their rhythm.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.name} delay={i * 0.1}>
              <div className="bg-white rounded-2xl p-6 sm:p-8 border-l-4 border-l-teal-600 border border-[#EDE9E3] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                <Quote className="w-8 h-8 text-teal-600/20 mb-3" strokeWidth={1.5} />
                <StarRating />
                <p className="text-base text-slate-700 italic leading-relaxed flex-1 mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.detail}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
