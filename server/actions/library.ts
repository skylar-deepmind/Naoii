"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveToLibraryAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const correctionId = formData.get("correctionId") as string;
  const postId = formData.get("postId") as string;

  if (!correctionId || !postId) {
    return { errors: { _form: ["参数错误"] } };
  }

  try {
    // Fetch correction with post
    const correction = await prisma.correction.findUnique({
      where: { id: correctionId },
      include: { post: { select: { content: true } } },
    });

    if (!correction || correction.status === "DELETED") {
      return { errors: { _form: ["修改建议不存在"] } };
    }
    if (!correction.isAccepted) {
      return { errors: { _form: ["只能收藏已采纳的修改建议"] } };
    }

    // Check for duplicate
    const existing = await prisma.expressionCollectionItem.findFirst({
      where: {
        userId: user.id,
        postId,
        correctionId,
      },
    });
    if (existing) {
      return { errors: { _form: ["已经收藏过了"] } };
    }

    await prisma.expressionCollectionItem.create({
      data: {
        userId: user.id,
        postId,
        correctionId,
        originalTextSnapshot: correction.post.content,
        correctedTextSnapshot: correction.correctedText,
        explanationSnapshot: correction.explanation,
        toneNoteSnapshot: correction.toneNote,
        tags: parseTags(formData.get("tags") as string),
      },
    });

    revalidatePath("/library");
    revalidatePath(`/posts/${postId}`);
    return { success: true };
  } catch (e: any) {
    console.error("saveToLibraryAction error:", e);
    return { errors: { _form: ["收藏失败，请稍后再试"] } };
  }
}

export async function removeFromLibraryAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const itemId = formData.get("itemId") as string;
  if (!itemId) {
    return { errors: { _form: ["参数错误"] } };
  }

  try {
    // Verify ownership
    const item = await prisma.expressionCollectionItem.findUnique({
      where: { id: itemId },
    });
    if (!item || item.userId !== user.id) {
      return { errors: { _form: ["收藏不存在"] } };
    }

    await prisma.expressionCollectionItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/library");
    return { success: true };
  } catch (e: any) {
    console.error("removeFromLibraryAction error:", e);
    return { errors: { _form: ["取消收藏失败，请稍后再试"] } };
  }
}

export async function updateLibraryTagsAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const itemId = formData.get("itemId") as string;
  if (!itemId) return { errors: { _form: ["参数错误"] } };

  try {
    const item = await prisma.expressionCollectionItem.findUnique({ where: { id: itemId } });
    if (!item || item.userId !== user.id) return { errors: { _form: ["收藏不存在"] } };

    await prisma.expressionCollectionItem.update({
      where: { id: itemId },
      data: { tags: parseTags(formData.get("tags") as string) },
    });

    revalidatePath("/library");
    return { success: true };
  } catch (e: any) {
    console.error("updateLibraryTagsAction error:", e);
    return { errors: { _form: ["更新标签失败"] } };
  }
}

function parseTags(input: string | null): string[] {
  if (!input) return [];
  return input
    .split(/[,，、]/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= 20)
    .slice(0, 10);
}
