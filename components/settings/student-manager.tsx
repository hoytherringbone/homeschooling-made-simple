"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStudent, updateStudent, deleteStudent, resetStudentPassword, createStudentLogin } from "@/lib/actions/settings";
import { GRADE_LEVELS } from "@/lib/constants";
import { Plus, Pencil, Trash2, X, Check, KeyRound, UserPlus } from "lucide-react";

interface Student {
  id: string;
  name: string;
  gradeLevel: string | null;
  userId: string | null;
}

export function StudentManager({ students }: { students: Student[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [createLogin, setCreateLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [createLoginId, setCreateLoginId] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createStudent({
        name: name.trim(),
        gradeLevel: gradeLevel || undefined,
        email: createLogin ? email : "",
        password: createLogin ? password : "",
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student added");
        setName("");
        setGradeLevel("");
        setEmail("");
        setPassword("");
        setCreateLogin(false);
        setShowAdd(false);
        router.refresh();
      }
    });
  };

  const handleUpdate = (id: string) => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await updateStudent({
        id,
        name: name.trim(),
        gradeLevel: gradeLevel || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student updated");
        setEditingId(null);
        setName("");
        setGradeLevel("");
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string, studentName: string) => {
    if (!confirm(`Delete "${studentName}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteStudent(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Student deleted");
        router.refresh();
      }
    });
  };

  const handleResetPassword = (studentId: string) => {
    if (!newPassword.trim()) return;
    startTransition(async () => {
      const result = await resetStudentPassword({
        studentId,
        newPassword: newPassword.trim(),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password reset successfully");
        setResetPasswordId(null);
        setNewPassword("");
      }
    });
  };

  const handleCreateLogin = (studentId: string) => {
    if (!loginEmail.trim() || !loginPassword.trim()) return;
    startTransition(async () => {
      const result = await createStudentLogin({
        studentId,
        email: loginEmail.trim(),
        password: loginPassword.trim(),
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Login created successfully");
        setCreateLoginId(null);
        setLoginEmail("");
        setLoginPassword("");
        router.refresh();
      }
    });
  };

  const startEdit = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setGradeLevel(student.gradeLevel || "");
    setShowAdd(false);
    setResetPasswordId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAdd(false);
    setName("");
    setGradeLevel("");
    setEmail("");
    setPassword("");
    setCreateLogin(false);
    setResetPasswordId(null);
    setNewPassword("");
    setCreateLoginId(null);
    setLoginEmail("");
    setLoginPassword("");
  };

  const inputClass =
    "rounded-xl border border-[#EDE9E3] bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all";

  const editRow = (onSubmit: () => void) => (
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Student name"
        className={`flex-1 ${inputClass}`}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
          if (e.key === "Escape") cancelEdit();
        }}
      />
      <select
        value={gradeLevel}
        onChange={(e) => setGradeLevel(e.target.value)}
        className={inputClass}
      >
        <option value="">Grade</option>
        {GRADE_LEVELS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <button
        onClick={onSubmit}
        disabled={isPending || !name.trim()}
        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={cancelEdit}
        className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      {students.map((student) => (
        <div key={student.id}>
          {editingId === student.id ? (
            editRow(() => handleUpdate(student.id))
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-white">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-sm text-slate-900">{student.name}</span>
                  {student.gradeLevel && (
                    <span className="text-xs text-slate-500 ml-2">
                      {student.gradeLevel} Grade
                    </span>
                  )}
                  {student.userId && (
                    <span className="text-xs text-teal-600 ml-2">
                      Has login
                    </span>
                  )}
                </div>
                {student.userId ? (
                  <button
                    onClick={() => {
                      setResetPasswordId(resetPasswordId === student.id ? null : student.id);
                      setNewPassword("");
                      setEditingId(null);
                      setShowAdd(false);
                      setCreateLoginId(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Reset password"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCreateLoginId(createLoginId === student.id ? null : student.id);
                      setLoginEmail("");
                      setLoginPassword("");
                      setEditingId(null);
                      setShowAdd(false);
                      setResetPasswordId(null);
                    }}
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    title="Create login"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => startEdit(student)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(student.id, student.name)}
                  disabled={isPending}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {resetPasswordId === student.id && (
                <div className="ml-11 flex items-center gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className={`flex-1 ${inputClass}`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleResetPassword(student.id);
                      if (e.key === "Escape") {
                        setResetPasswordId(null);
                        setNewPassword("");
                      }
                    }}
                  />
                  <button
                    onClick={() => handleResetPassword(student.id)}
                    disabled={isPending || newPassword.length < 6}
                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setResetPasswordId(null);
                      setNewPassword("");
                    }}
                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {createLoginId === student.id && (
                <div className="ml-11 space-y-2">
                  <p className="text-xs text-slate-500">Create a login so this student can sign in:</p>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Student email"
                    className={`w-full ${inputClass}`}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Password (min 6 chars)"
                      className={`flex-1 ${inputClass}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreateLogin(student.id);
                        if (e.key === "Escape") {
                          setCreateLoginId(null);
                          setLoginEmail("");
                          setLoginPassword("");
                        }
                      }}
                    />
                    <button
                      onClick={() => handleCreateLogin(student.id)}
                      disabled={isPending || !loginEmail.trim() || loginPassword.length < 6}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCreateLoginId(null);
                        setLoginEmail("");
                        setLoginPassword("");
                      }}
                      className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {showAdd ? (
        <div className="space-y-3">
          {editRow(handleAdd)}
          <div className="ml-1">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={createLogin}
                onChange={(e) => {
                  setCreateLogin(e.target.checked);
                  if (!e.target.checked) {
                    setEmail("");
                    setPassword("");
                  }
                }}
                className="rounded border-[#EDE9E3] text-teal-600 focus:ring-teal-600/20"
              />
              Create login account for this student
            </label>
            {createLogin && (
              <div className="mt-3 space-y-2 pl-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Student email"
                  className={`w-full ${inputClass}`}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 characters)"
                  className={`w-full ${inputClass}`}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
            setName("");
            setGradeLevel("");
            setEmail("");
            setPassword("");
            setCreateLogin(false);
            setResetPasswordId(null);
          }}
          className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </button>
      )}
    </div>
  );
}
