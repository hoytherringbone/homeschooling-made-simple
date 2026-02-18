"use client";

import { Download } from "lucide-react";

interface Column {
  key: string;
  label: string;
}

interface CSVExportProps {
  data: Record<string, any>[];
  filename: string;
  columns: Column[];
}

export function CSVExportButton({ data, filename, columns }: CSVExportProps) {
  const handleExport = () => {
    if (data.length === 0) return;

    const header = columns.map((c) => `"${c.label}"`).join(",");
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = row[c.key] ?? "";
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(",")
    );

    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={data.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
