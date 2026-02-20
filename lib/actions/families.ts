"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function deleteFamily(familyId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };
  if (session.user.role !== "SUPER_ADMIN") return { error: "Only admins can delete families" };

  const family = await db.family.findUnique({
    where: { id: familyId },
    select: { name: true },
  });
  if (!family) return { error: "Family not found" };
  if (family.name === "HSMS Administration") return { error: "Cannot delete the administration family" };

  await db.family.delete({ where: { id: familyId } });

  redirect("/admin/families");
}
