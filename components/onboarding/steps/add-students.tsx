"use client";

import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { GRADE_LEVELS } from "@/lib/constants";
import { createStudents } from "@/lib/actions/onboarding";
import type { StudentInput } from "@/lib/validations/onboarding";

interface StudentRow extends StudentInput {
  createLogin: boolean;
}

interface AddStudentsStepProps {
  familyId: string;
  onComplete: (students: StudentInput[]) => void;
}

export function AddStudentsStep({ familyId, onComplete }: AddStudentsStepProps) {
  const [students, setStudents] = useState<StudentRow[]>([
    { name: "", gradeLevel: "", email: "", password: "", createLogin: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addStudent = () => {
    setStudents([...students, { name: "", gradeLevel: "", email: "", password: "", createLogin: false }]);
  };

  const removeStudent = (index: number) => {
    if (students.length <= 1) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, field: string, value: string | boolean) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "createLogin" && !value) {
      updated[index].email = "";
      updated[index].password = "";
    }
    setStudents(updated);
  };

  const handleSubmit = async () => {
    const valid = students.every((s) => s.name.trim() && s.gradeLevel);
    if (!valid) {
      setError("Please fill in all student names and grade levels");
      return;
    }

    const loginIncomplete = students.some(
      (s) => s.createLogin && (!s.email?.trim() || !s.password || s.password.length < 6)
    );
    if (loginIncomplete) {
      setError("Please fill in email and password (min 6 chars) for students with login enabled");
      return;
    }

    setLoading(true);
    setError(null);

    const payload: StudentInput[] = students.map((s) => ({
      name: s.name,
      gradeLevel: s.gradeLevel,
      email: s.createLogin ? s.email : "",
      password: s.createLogin ? s.password : "",
    }));

    const result = await createStudents(familyId, payload);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onComplete(payload);
  };

  const inputClass =
    "w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-teal-600" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Add your students
          </h2>
          <p className="text-sm text-slate-500">
            Who will you be teaching? You can always add more later.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        {students.map((student, i) => (
          <div key={i} className="space-y-2">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={student.name}
                  onChange={(e) => updateStudent(i, "name", e.target.value)}
                  placeholder="Student name"
                  className={inputClass}
                />
              </div>
              <div className="w-36">
                <select
                  value={student.gradeLevel}
                  onChange={(e) => updateStudent(i, "gradeLevel", e.target.value)}
                  className="w-full rounded-xl border border-[#EDE9E3] bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all appearance-none"
                >
                  <option value="">Grade</option>
                  {GRADE_LEVELS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => removeStudent(i)}
                disabled={students.length <= 1}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="pl-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={student.createLogin}
                  onChange={(e) => updateStudent(i, "createLogin", e.target.checked)}
                  className="rounded border-[#EDE9E3] text-teal-600 focus:ring-teal-600/20"
                />
                Create login account
              </label>
              {student.createLogin && (
                <div className="mt-2 space-y-2 pl-6">
                  <input
                    type="email"
                    value={student.email || ""}
                    onChange={(e) => updateStudent(i, "email", e.target.value)}
                    placeholder="Student email"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={student.password || ""}
                    onChange={(e) => updateStudent(i, "password", e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addStudent}
        className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:text-teal-700 transition-colors mb-8"
      >
        <Plus className="w-4 h-4" />
        Add another student
      </button>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </div>
  );
}
