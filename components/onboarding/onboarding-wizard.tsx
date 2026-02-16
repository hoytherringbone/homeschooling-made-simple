"use client";

import { useState } from "react";
import { AddStudentsStep } from "./steps/add-students";
import { SetupSubjectsStep } from "./steps/setup-subjects";
import { CompleteStep } from "./steps/complete";
import type { StudentInput, SubjectInput } from "@/lib/validations/onboarding";

const steps = ["Add Students", "Set Up Subjects", "All Done"];

interface OnboardingWizardProps {
  familyId: string;
  userName: string;
}

export function OnboardingWizard({ familyId, userName }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [studentsData, setStudentsData] = useState<StudentInput[]>([]);
  const [subjectsData, setSubjectsData] = useState<SubjectInput[]>([]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-10">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= currentStep
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < currentStep ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1.5 ${
                    i <= currentStep ? "text-teal-600 font-medium" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-px mx-2 mb-5 ${
                    i < currentStep ? "bg-teal-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EDE9E3] p-8">
          {currentStep === 0 && (
            <AddStudentsStep
              familyId={familyId}
              onComplete={(students) => {
                setStudentsData(students);
                setCurrentStep(1);
              }}
            />
          )}
          {currentStep === 1 && (
            <SetupSubjectsStep
              familyId={familyId}
              onComplete={(subjects) => {
                setSubjectsData(subjects);
                setCurrentStep(2);
              }}
              onBack={() => setCurrentStep(0)}
            />
          )}
          {currentStep === 2 && (
            <CompleteStep
              studentsCount={studentsData.length}
              subjectsCount={subjectsData.length}
            />
          )}
        </div>
      </div>
    </div>
  );
}
