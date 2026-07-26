"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTopicCommentAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const topicId = formData.get("topicId") as string;
  const body = formData.get("body") as string;
  const parentId = (formData.get("parentId") as string) || null;

  if (!topicId || !body?.trim()) {
    return { errors: { _form: ["请输入讨论内容"] } };
  }

  if (body.length > 5000) {
    return { errors: { _form: ["讨论内容不能超过 5000 字"] } };
  }

  try {
    await prisma.comment.create({
      data: {
        topicId,
        authorId: user.id,
        parentId,
        body: body.trim(),
      },
    });

    revalidatePath(`/topics/${topicId}`);
    return { success: true };
  } catch (e) {
    console.error("createTopicCommentAction error:", e);
    return { errors: { _form: ["讨论发表失败，请稍后再试"] } };
  }
}
