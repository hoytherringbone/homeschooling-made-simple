import { HelpCircle, BookOpen, GraduationCap, BarChart3, Settings } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const sections = [
  {
    title: "Getting Started",
    icon: HelpCircle,
    items: [
      {
        question: "How do I add students?",
        answer: `Go to the Students page from the sidebar. Click the "Add Student" button in the top right. Fill in the student's name, grade level, and optionally select their subjects. Once added, the student will appear on your dashboard and you can start creating assignments for them.`,
      },
    ],
  },
  {
    title: "Assignments",
    icon: BookOpen,
    items: [
      {
        question: "How do I create an assignment?",
        answer: `Go to the Assignments page and click "New Assignment." Select a student, choose a subject, add a title and optional description, set a due date, priority level, and estimated time. You can also assign a category (Test, Quiz, Homework, or Project) if you want it to count toward weighted grading. Click "Create" to save.`,
      },
      {
        question: "How do I bulk import assignments with CSV?",
        answer: `On the Assignments page, click the "Import CSV" button. Select a CSV file from your computer. You'll see a preview table showing each row and any validation errors. Fix any issues in your file and re-upload, or proceed to import the valid rows. The required columns are "title" and "student." Optional columns include: description, subject, due_date, priority, and estimated_minutes.`,
      },
      {
        question: "What is a CSV file and why does column order matter?",
        answer: `A CSV (Comma-Separated Values) file is a simple spreadsheet format where each line is a row and commas separate the columns. You can create one in Excel, Google Sheets, or any text editor. When you export from a spreadsheet app, choose "Save as CSV."

The first row of your CSV must be the column headers (e.g., title, student, subject, due_date). The importer matches columns by name, so the headers must be spelled exactly as expected. The order of columns doesn't matter as long as the header names match. Required columns are "title" and "student" — everything else is optional.

Example:
title, student, subject, due_date, priority
Chapter 5 Review, Emma, Math, 2026-03-15, HIGH
Reading Journal, Liam, Reading, 2026-03-16, MEDIUM`,
      },
      {
        question: "What do the assignment statuses mean?",
        answer: `There are two statuses:

Assigned — The assignment has been given to the student and is waiting to be completed.

Completed — The student has submitted the assignment and it has been marked as done.

When a student submits their work, it moves from Assigned to Completed. As a parent, you can return it with feedback (which moves it back to Assigned) or approve it and optionally assign a grade.`,
      },
      {
        question: "How does my student submit work?",
        answer: `When a student logs in, they see their assignments on their dashboard. Each assignment with "Assigned" status has a "Submit" button. The student clicks "Submit" to mark it as complete. The assignment then moves to "Completed" status and you'll be notified.`,
      },
    ],
  },
  {
    title: "Grading",
    icon: GraduationCap,
    items: [
      {
        question: "How do I grade an assignment?",
        answer: `Open a completed assignment. You'll see a "Grade" dropdown next to the assignment details. Select a letter grade (A+ through F) from the dropdown — the grade is saved automatically. You can change the grade at any time by selecting a different option.`,
      },
      {
        question: "What do the letter grades mean?",
        answer: `Each letter grade corresponds to a GPA value on a 4.0 scale:

A+ = 4.0, A = 4.0, A- = 3.7
B+ = 3.3, B = 3.0, B- = 2.7
C+ = 2.3, C = 2.0, C- = 1.7
D+ = 1.3, D = 1.0
F = 0.0

These values are used to calculate your student's GPA on the Progress Reports page.`,
      },
      {
        question: "How do assignment categories work?",
        answer: `Each assignment can be categorized as a Test, Quiz, Homework, or Project. Categories are optional but important if you want to use weighted grading. When you set up subject weights (e.g., Tests = 40%, Homework = 30%, Projects = 20%, Quizzes = 10%), the GPA for that subject is calculated based on how much each category counts rather than a simple average.`,
      },
      {
        question: "What is weighted vs. unweighted GPA?",
        answer: `An unweighted GPA is a simple average of all assignment grades in a subject — every assignment counts equally.

A weighted GPA takes assignment categories into account. For example, if Tests are weighted at 40% and Homework at 30%, a test grade has more impact on the overall GPA than a homework grade. This gives a more accurate picture of performance on higher-stakes work.

On the Progress Reports page, subjects with weights configured will show "weighted" next to their GPA. You can set up weights per subject in the Subjects settings.`,
      },
    ],
  },
  {
    title: "Progress Reports",
    icon: BarChart3,
    items: [
      {
        question: "How do I view my students' progress?",
        answer: `Go to Reports in the sidebar, then select "Progress Report." You'll see each student with their overall completion rate, GPA, and a breakdown by subject. Each subject shows how many assignments have been completed and the average grade. You can filter by date range to see progress over a specific period.`,
      },
      {
        question: "How do I export a progress report?",
        answer: `On the Progress Report page, click the "Export CSV" button in the top right corner. This downloads a CSV file with each student's data broken down by subject, including completion rates, GPA, letter grades, and whether weighted grading is applied. You can open this file in Excel or Google Sheets.`,
      },
    ],
  },
  {
    title: "Account & Settings",
    icon: Settings,
    items: [
      {
        question: "How do I switch to dark mode?",
        answer: `Click the sun/moon icon in the top right corner of any page. This toggles between light mode and dark mode. Your preference is saved automatically.`,
      },
      {
        question: "How do I change notification preferences?",
        answer: `Go to Settings from the sidebar. Under the Notifications section, you can toggle email notifications and in-app notifications on or off. You'll receive notifications when students submit assignments, when assignments are returned with feedback, and other important updates.`,
      },
    ],
  },
];

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Support
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Frequently asked questions about using HSMS.
        </p>
      </div>

      {sections.map((section) => (
        <div
          key={section.title}
          className="bg-white dark:bg-slate-800 rounded-2xl border border-[#EDE9E3] dark:border-slate-700 p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <section.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" strokeWidth={1.75} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {section.title}
            </h2>
          </div>

          <Accordion type="single" collapsible>
            {section.items.map((item, i) => (
              <AccordionItem key={i} value={`${section.title}-${i}`}>
                <AccordionTrigger className="text-slate-700 dark:text-slate-300 hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
