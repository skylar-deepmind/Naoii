"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

type ActionErrors = Record<string, string[]>;

export async function registerAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors }> {
  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { username, email, password, nativeLanguage, learningLanguage, level } =
    parsed.data;

  // Check uniqueness
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    const errors: ActionErrors = {};
    if (existing.username === username) errors.username = ["用户名已被注册"];
    if (existing.email === email) errors.email = ["邮箱已被注册"];
    return { errors };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      profile: {
        create: {
          nativeLanguageId: nativeLanguage,
          learningLanguageId: learningLanguage,
          level: level as any,
        },
      },
    },
  });

  await createSession(user.id);
  redirect("/app");
}

export async function loginAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors }> {
  const raw = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.status !== "ACTIVE") {
    return { errors: { email: ["邮箱或密码错误"] } };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { errors: { email: ["邮箱或密码错误"] } };
  }

  await createSession(user.id);
  redirect("/app");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
