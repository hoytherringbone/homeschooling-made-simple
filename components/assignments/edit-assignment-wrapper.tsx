"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { EditAssignmentForm } from "./edit-assignment-form";

interface Student {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  studentId: string;
  subjectId: string | null;
  category: string | null;
  priority: string;
  dueDate: Date | null;
  estimatedMinutes: number | null;
}

interface EditAssignmentWrapperProps {
  assignment: Assignment;
  students: Student[];
  subjects: Subject[];
}

export function EditAssignmentWrapper({ assignment, students, subjects }: EditAssignmentWrapperProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="bg-white rounded-2xl border border-[#EDE9E3] p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Edit Assignment</h2>
        <EditAssignmentForm
          assignment={assignment}
          students={students}
          subjects={subjects}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
    >
      <Pencil className="w-3.5 h-3.5" />
      Edit
    </button>
  );
}
