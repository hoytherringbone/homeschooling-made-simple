"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, HelpCircle, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { bulkCreateAssignments } from "@/lib/actions/assignments";
import type { ImportRowValues } from "@/lib/validations/assignments";

interface CsvImportDialogProps {
  students: { id: string; name: string }[];
  subjects: { id: string; name: string }[];
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

function mapRow(raw: Record<string, string>): ImportRowValues {
  return {
    title: raw.title || "",
    description: raw.description || undefined,
    studentName: raw.student || raw.student_name || raw.studentname || "",
    subjectName: raw.subject || raw.subject_name || raw.subjectname || undefined,
    dueDate: raw.due_date || raw.duedate || raw.due || undefined,
    priority: (raw.priority?.toUpperCase() as "LOW" | "MEDIUM" | "HIGH") || "MEDIUM",
    estimatedMinutes: raw.estimated_minutes || raw.estimatedminutes || raw.minutes
      ? Number(raw.estimated_minutes || raw.estimatedminutes || raw.minutes)
      : undefined,
  };
}

export function CsvImportDialog({ students, subjects }: CsvImportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [parsedRows, setParsedRows] = useState<ImportRowValues[]>([]);
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentNames = new Set(students.map((s) => s.name.toLowerCase()));
  const subjectNames = new Set(subjects.map((s) => s.name.toLowerCase()));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rawRows = parseCSV(text);

      if (rawRows.length === 0) {
        toast.error("No data rows found in CSV");
        return;
      }

      const mapped = rawRows.map(mapRow);
      const errors: string[] = [];

      mapped.forEach((row, i) => {
        const issues: string[] = [];
        if (!row.title) issues.push("missing title");
        if (!row.studentName) issues.push("missing student");
        if (row.studentName && !studentNames.has(row.studentName.toLowerCase())) {
          issues.push(`student "${row.studentName}" not found`);
        }
        if (row.subjectName && !subjectNames.has(row.subjectName.toLowerCase())) {
          issues.push(`subject "${row.subjectName}" not found`);
        }
        errors[i] = issues.length > 0 ? issues.join(", ") : "";
      });

      setParsedRows(mapped);
      setRowErrors(errors);
    };
    reader.readAsText(file);

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const hasErrors = rowErrors.some((e) => e);
  const validCount = rowErrors.filter((e) => !e).length;

  const handleImport = () => {
    if (hasErrors) {
      toast.error("Fix errors before importing");
      return;
    }

    startTransition(async () => {
      const result = await bulkCreateAssignments(parsedRows);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.count} assignment${result.count !== 1 ? "s" : ""} imported!`);
        setParsedRows([]);
        setRowErrors([]);
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <div className="relative inline-flex items-center gap-1">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#EDE9E3] hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-full transition-colors"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          title="CSV format help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
        {showHelp && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl border border-[#EDE9E3] shadow-lg p-4 z-50">
            <p className="text-sm font-semibold text-slate-900 mb-2">CSV Format</p>
            <p className="text-xs text-slate-600 mb-2">
              Required columns: <span className="font-medium">title</span>, <span className="font-medium">student</span>
            </p>
            <p className="text-xs text-slate-600 mb-2">
              Optional columns: description, subject, due_date, priority, estimated_minutes
            </p>
            <div className="text-xs text-slate-500 space-y-1">
              <p><span className="font-medium">student:</span> Must match an existing student name</p>
              <p><span className="font-medium">subject:</span> Must match an existing subject name</p>
              <p><span className="font-medium">due_date:</span> YYYY-MM-DD or MM/DD/YYYY</p>
              <p><span className="font-medium">priority:</span> LOW, MEDIUM, or HIGH (default: MEDIUM)</p>
              <p><span className="font-medium">estimated_minutes:</span> Number between 1-480</p>
            </div>
            <div className="mt-3 p-2 bg-slate-50 rounded-lg">
              <p className="text-[10px] font-mono text-slate-600">
                title,student,subject,due_date<br />
                Math Ch.5,Emma,Math,2026-03-01<br />
                Reading Log,Liam,Reading,2026-03-02
              </p>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EDE9E3] shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EDE9E3]">
              <h2 className="text-lg font-semibold text-slate-900">Import Assignments from CSV</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setParsedRows([]);
                  setRowErrors([]);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {parsedRows.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-4">
                    Select a CSV file to preview and import assignments.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Choose File
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-600 mb-3">
                    {validCount} of {parsedRows.length} rows ready to import
                    {hasErrors && <span className="text-rose-600 ml-1">— fix errors below</span>}
                  </p>
                  <div className="border border-[#EDE9E3] rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-left">
                          <th className="px-3 py-2 text-xs font-medium text-slate-500 w-8"></th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500">Title</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500">Student</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500">Subject</th>
                          <th className="px-3 py-2 text-xs font-medium text-slate-500">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDE9E3]">
                        {parsedRows.map((row, i) => (
                          <tr key={i} className={rowErrors[i] ? "bg-rose-50" : ""}>
                            <td className="px-3 py-2">
                              {rowErrors[i] ? (
                                <AlertCircle className="w-4 h-4 text-rose-500" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-900 truncate max-w-[150px]">
                              {row.title || <span className="text-rose-400 italic">missing</span>}
                            </td>
                            <td className="px-3 py-2 text-slate-700">{row.studentName || "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{row.subjectName || "—"}</td>
                            <td className="px-3 py-2 text-slate-700">{row.dueDate || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hasErrors && (
                    <div className="mt-3 space-y-1">
                      {rowErrors.map((err, i) =>
                        err ? (
                          <p key={i} className="text-xs text-rose-600">
                            Row {i + 1}: {err}
                          </p>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {parsedRows.length > 0 && (
              <div className="flex items-center justify-between p-5 border-t border-[#EDE9E3]">
                <button
                  onClick={() => {
                    setParsedRows([]);
                    setRowErrors([]);
                    fileInputRef.current?.click();
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Choose different file
                </button>
                <button
                  onClick={handleImport}
                  disabled={isPending || hasErrors}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-colors disabled:opacity-50"
                >
                  {isPending ? "Importing..." : `Import ${validCount} Assignment${validCount !== 1 ? "s" : ""}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
