"use client";

import { ScrollReveal } from "@/components/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this a curriculum or lesson plan provider?",
    answer:
      "No. Home Schooling Made Simple is a tracking and organization tool. You bring the curriculum and the lesson plans — we help you assign, track, and report on the work. Think of it as your homeschool command center, not your textbook.",
  },
  {
    question: "How many students can I add?",
    answer:
      "As many as you need. There are no per-student fees. Whether you have one child or eight, the price is the same.",
  },
  {
    question: "Can my students log in and use it themselves?",
    answer:
      "Yes. You can create individual student accounts for each child. They'll see their own dashboard with their assignments, progress, and due dates. They can mark work as in progress, submit it for your review, and add notes.",
  },
  {
    question: "Do I need to be tech-savvy to use this?",
    answer:
      "Not at all. If you can use email, you can use this. The setup takes under two minutes, and the interface is designed to be intuitive from the first click.",
  },
  {
    question: "Can this help with state reporting requirements?",
    answer:
      "Yes. You can log attendance, track hours by subject, and export formatted progress reports as PDFs. While every state has different requirements, our reports are designed to cover the most common documentation needs.",
  },
  {
    question: "Can both parents have access?",
    answer:
      "Absolutely. You can add multiple parent accounts to your family. Both parents get full access to the dashboard, assignments, and reports.",
  },
  {
    question: "What happens after my free trial ends?",
    answer:
      "You'll be prompted to choose a plan. If you decide not to continue, your account will be paused — we won't delete your data. You can come back and pick up where you left off anytime.",
  },
];

export function FAQSection() {
  return (
    <section className="bg-sand py-20 sm:py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-center mb-14">
            Questions? We&apos;ve got answers.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-white border border-[#EDE9E3] rounded-xl px-6 data-[state=open]:shadow-sm transition-shadow"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-slate-900 py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-500 leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
