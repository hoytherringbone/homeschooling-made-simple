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
  ASSIGNED: { roles: ["STUDENT"], to: ["COMPLETED"] },
  COMPLETED: { roles: ["PARENT", "SUPER_ADMIN"], to: ["ASSIGNED"] },
};

export const LETTER_GRADES = [
  { label: "A+", value: 98 },
  { label: "A", value: 95 },
  { label: "A-", value: 92 },
  { label: "B+", value: 88 },
  { label: "B", value: 85 },
  { label: "B-", value: 82 },
  { label: "C+", value: 78 },
  { label: "C", value: 75 },
  { label: "C-", value: 72 },
  { label: "D+", value: 68 },
  { label: "D", value: 65 },
  { label: "D-", value: 62 },
  { label: "F", value: 50 },
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
