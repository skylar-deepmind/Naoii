"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const correctionSchema = z.object({
  postId: z.string().min(1),
  correctedText: z.string().min(1, "请输入修改后的文本").max(3000),
  explanation: z.string().max(1000).optional(),
  toneNote: z.string().max(100).optional(),
});

type ActionErrors = Record<string, string[]>;

export async function createCorrectionAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = correctionSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { postId, correctedText, explanation, toneNote } = parsed.data;

  try {
    // Fetch post to check author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, content: true, status: true },
    });

    if (!post) {
      return { errors: { _form: ["帖子不存在"] } };
    }

    if (post.authorId === user.id) {
      return { errors: { _form: ["不能给自己的帖子提交修改建议"] } };
    }

    // Create correction with one default segment
    const correction = await prisma.correction.create({
      data: {
        postId,
        authorId: user.id,
        correctedText,
        explanation: explanation || null,
        toneNote: toneNote || null,
        status: "PUBLISHED",
        segments: {
          create: {
            position: 0,
            originalText: post.content,
            correctedText,
            explanation: explanation || null,
          },
        },
      },
    });

    // Create notification for post author
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "CORRECTION_RECEIVED",
        title: "收到新的修改建议",
        body: `${user.displayName || user.username} 对你的表达提交了修改建议`,
        relatedPostId: postId,
        relatedCorrectionId: correction.id,
      },
    });

    revalidatePath(`/posts/${postId}`);

    return { success: true };
  } catch (e: any) {
    console.error("createCorrectionAction error:", e);
    return { errors: { _form: ["提交失败，请稍后再试"] } };
  }
}
