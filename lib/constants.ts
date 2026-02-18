export const SUBJECT_COLORS = [
  "#0D9488", // teal
  "#2563EB", // blue
  "#9333EA", // purple
  "#16A34A", // green
  "#F59E0B", // amber
  "#E11D48", // rose
  "#0F766E", // teal-dark
  "#7C3AED", // violet
  "#DC2626", // red
  "#0891B2", // cyan
  "#CA8A04", // yellow
  "#4F46E5", // indigo
  "#C026D3", // fuchsia
  "#059669", // emerald
  "#EA580C", // orange
  "#6366F1", // blue-violet
];

export const DEFAULT_SUBJECTS = [
  "Math",
  "Reading",
  "Language Arts",
  "Science",
  "History",
  "Geography",
  "Social Studies",
  "Spanish",
  "Foreign Language",
  "Art",
  "Music",
  "Physical Education",
  "Health",
  "Computer Science",
  "Bible",
  "Life Skills",
];

export const GRADE_LEVELS = [
  "Pre-K",
  "Kindergarten",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
];

export const ASSIGNMENT_STATUS = {
  ASSIGNED: { label: "Assigned", bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-700 dark:text-slate-300" },
  COMPLETED: { label: "Completed", bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
} as const;

export const VALID_TRANSITIONS: Record<string, { roles: string[]; to: string[] }> = {
  ASSIGNED: { roles: ["STUDENT", "PARENT", "SUPER_ADMIN"], to: ["COMPLETED"] },
  COMPLETED: { roles: ["PARENT", "SUPER_ADMIN"], to: ["COMPLETED", "ASSIGNED"] },
};

export const LETTER_GRADES = [
  { label: "A+", value: 4.0 },
  { label: "A", value: 4.0 },
  { label: "A-", value: 3.7 },
  { label: "B+", value: 3.3 },
  { label: "B", value: 3.0 },
  { label: "B-", value: 2.7 },
  { label: "C+", value: 2.3 },
  { label: "C", value: 2.0 },
  { label: "C-", value: 1.7 },
  { label: "D+", value: 1.3 },
  { label: "D", value: 1.0 },
  { label: "F", value: 0.0 },
] as const;

export const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
] as const;

export const PRIORITY_COLORS = {
  LOW: { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300" },
  MEDIUM: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  HIGH: { bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-600 dark:text-rose-400" },
} as const;
