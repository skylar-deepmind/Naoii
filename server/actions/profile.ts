"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

type ActionErrors = Record<string, string[]>;

export async function updateProfileAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors; success?: boolean }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { errors: { _form: ["请先登录"] } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = updateProfileSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { displayName, bio, nativeLanguage, learningLanguage, level } =
    parsed.data;

  await prisma.userProfile.update({
    where: { userId: currentUser.id },
    data: {
      displayName: displayName || null,
      bio: bio || null,
      ...(nativeLanguage ? { nativeLanguageId: nativeLanguage } : {}),
      ...(learningLanguage ? { learningLanguageId: learningLanguage } : {}),
      ...(level ? { level: level as any } : {}),
    },
  });

  revalidatePath("/settings/profile");
  revalidatePath(`/profile/${currentUser.username}`);

  return { success: true };
}
