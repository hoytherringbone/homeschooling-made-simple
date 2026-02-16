"use server";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/lib/validations/auth";
import { z } from "zod";

export async function signup(values: z.infer<typeof signupSchema>) {
  const parsed = signupSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid fields" };
  }

  const { familyName, name, email, password } = parsed.data;

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.family.create({
    data: {
      name: familyName,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      users: {
        create: {
          email,
          name,
          hashedPassword,
          role: "PARENT",
          onboarded: false,
        },
      },
    },
  });

  await signIn("credentials", {
    email,
    password,
    redirectTo: "/onboarding",
  });
}
