"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ─── Entry Like ───────────────────────────────────────

export async function toggleLikeAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; liked?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const entryId = formData.get("entryId") as string;
  if (!entryId) return { errors: { _form: ["参数错误"] } };

  try {
    const existing = await prisma.entryLike.findUnique({
      where: { entryId_userId: { entryId, userId: user.id } },
    });

    if (existing) {
      await prisma.entryLike.delete({ where: { id: existing.id } });
      revalidatePath(`/posts/${entryId}`);
      revalidatePath(`/articles/${entryId}`);
      revalidatePath("/feed");
      return { liked: false };
    } else {
      await prisma.entryLike.create({
        data: { entryId, userId: user.id },
      });
      revalidatePath(`/posts/${entryId}`);
      revalidatePath(`/articles/${entryId}`);
      revalidatePath("/feed");
      return { liked: true };
    }
  } catch (e) {
    console.error("toggleLikeAction error:", e);
    return { errors: { _form: ["操作失败"] } };
  }
}

export async function getEntryLikeStatus(entryId: string, userId: string) {
  const like = await prisma.entryLike.findUnique({
    where: { entryId_userId: { entryId, userId } },
  });
  return !!like;
}

export async function getEntryLikeCount(entryId: string) {
  return prisma.entryLike.count({ where: { entryId } });
}

// ─── Comment ──────────────────────────────────────────

export async function createCommentAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const entryId = formData.get("entryId") as string;
  const body = formData.get("body") as string;
  const parentId = (formData.get("parentId") as string) || null;
  const correctionId = (formData.get("correctionId") as string) || null;

  if (!entryId || !body?.trim()) {
    return { errors: { _form: ["请输入评论内容"] } };
  }

  if (body.length > 5000) {
    return { errors: { _form: ["评论不能超过 5000 字"] } };
  }

  try {
    await prisma.comment.create({
      data: {
        entryId,
        authorId: user.id,
        parentId,
        correctionId: correctionId || null,
        body: body.trim(),
      },
    });

    revalidatePath(`/posts/${entryId}`);
    revalidatePath(`/articles/${entryId}`);
    return { success: true };
  } catch (e) {
    console.error("createCommentAction error:", e);
    return { errors: { _form: ["评论失败，请稍后再试"] } };
  }
}

export async function deleteCommentAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const commentId = formData.get("commentId") as string;
  if (!commentId) return { errors: { _form: ["参数错误"] } };

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, entryId: true },
    });

    if (!comment) return { errors: { _form: ["评论不存在"] } };
    if (comment.authorId !== user.id && user.role !== "ADMIN") {
      return { errors: { _form: ["你只能删除自己的评论"] } };
    }

    await prisma.comment.delete({ where: { id: commentId } });
    revalidatePath(`/posts/${comment.entryId}`);
    revalidatePath(`/articles/${comment.entryId}`);
    return { success: true };
  } catch (e) {
    console.error("deleteCommentAction error:", e);
    return { errors: { _form: ["删除失败"] } };
  }
}

// ─── Comment Like ─────────────────────────────────────

export async function toggleCommentLikeAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; liked?: boolean; newCount?: number }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const commentId = formData.get("commentId") as string;
  if (!commentId) return { errors: { _form: ["参数错误"] } };

  try {
    const existing = await prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId: user.id } },
    });

    if (existing) {
      await prisma.commentLike.delete({ where: { id: existing.id } });
      await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      });
      const updated = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likeCount: true },
      });
      return { liked: false, newCount: updated?.likeCount ?? 0 };
    } else {
      await prisma.commentLike.create({
        data: { commentId, userId: user.id },
      });
      await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { increment: 1 } },
      });
      const updated = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { likeCount: true },
      });
      return { liked: true, newCount: updated?.likeCount ?? 1 };
    }
  } catch (e) {
    console.error("toggleCommentLikeAction error:", e);
    return { errors: { _form: ["操作失败"] } };
  }
}
