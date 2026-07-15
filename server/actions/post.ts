"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPostSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionErrors = Record<string, string[]>;

export async function createPostAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createPostSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { title, content, sourceLanguage, targetLanguage, expressionType, tone, visibility, completeness } =
    parsed.data;

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      title: title || null,
      content,
      sourceLanguageId: sourceLanguage,
      targetLanguageId: targetLanguage,
      expressionType,
      tone,
      visibility,
      completeness,
      status: "PUBLISHED",
    },
  });

  revalidatePath("/feed");
  redirect(`/posts/${post.id}`);
}
