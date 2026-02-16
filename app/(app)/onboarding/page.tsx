import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const familyId = session.user.familyId;
  if (!familyId) redirect("/login");

  return <OnboardingWizard familyId={familyId} userName={session.user.name || ""} />;
}
