"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupValues } from "@/lib/validations/auth";
import { signup } from "@/lib/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupValues) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signup(values);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // signIn with redirect throws a NEXT_REDIRECT error — that's expected
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EDE9E3] p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Start your free trial
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          14 days free. No credit card required.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Family Name
          </label>
          <input
            {...register("familyName")}
            type="text"
            placeholder="The Smith Family"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
          {errors.familyName && (
            <p className="text-xs text-rose-600 mt-1">{errors.familyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Your Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Sarah Smith"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
          {errors.name && (
            <p className="text-xs text-rose-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="sarah@example.com"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
          {errors.email && (
            <p className="text-xs text-rose-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            placeholder="At least 8 characters"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
          {errors.password && (
            <p className="text-xs text-rose-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Confirm Password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            placeholder="Confirm your password"
            className="w-full rounded-xl border border-[#EDE9E3] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 transition-all"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-rose-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white rounded-full px-6 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] mt-2"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-600 font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
