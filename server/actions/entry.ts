"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEntrySchema, updateEntrySchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

type ActionErrors = Record<string, string[]>;

// ─── Create ──────────────────────────────────────────

export async function createEntryAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = createEntrySchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { type, title, content, coverImage, sourceLanguage, targetLanguage, expressionType, tone, completeness, visibility, status } =
    parsed.data;

  try {
    const entry = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const e = await tx.entry.create({
        data: {
          authorId: user.id,
          type: type === "ARTICLE" ? "ARTICLE" : "MOMENT",
          title: title || null,
          content: content || "",
          coverImage: coverImage || null,
          sourceLanguageId: sourceLanguage || null,
          targetLanguageId: targetLanguage || null,
          expressionType: expressionType || null,
          tone: tone || null,
          completeness: completeness || null,
          visibility,
          status,
          publishedAt: status === "PUBLISHED" ? now : null,
        },
      });

      // Mirror Post record for backward compat with Correction.postId FK
      await tx.post.create({
        data: {
          id: e.id,
          authorId: e.authorId,
          title: e.title,
          content: e.content,
          sourceLanguageId: e.sourceLanguageId,
          targetLanguageId: e.targetLanguageId,
          expressionType: e.expressionType,
          tone: e.tone,
          completeness: (e.completeness as any) || "COMPLETE",
          visibility: (e.visibility as any) || "PUBLIC",
          status: e.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
        },
      });

      return e;
    });

    revalidatePath("/feed");
    redirect(`/posts/${entry.id}`);
  } catch (e: any) {
    if (e?.digest?.startsWith?.("NEXT_REDIRECT")) throw e;
    console.error("createEntryAction error:", e);
    return { errors: { _form: ["发布失败，请稍后再试"] } };
  }
}

// ─── Update ──────────────────────────────────────────

export async function updateEntryAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = updateEntrySchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as ActionErrors };
  }

  const { entryId, title, content, coverImage, sourceLanguage, targetLanguage, expressionType, tone, completeness, visibility } =
    parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const entry = await tx.entry.findUnique({ where: { id: entryId }, select: { authorId: true, status: true } });
      if (!entry) throw new Error("ENTRY_NOT_FOUND");
      if (entry.authorId !== user.id) throw new Error("NOT_AUTHOR");
      if (entry.status === "PUBLISHED" && content) {
        // Content can still be edited after publish
      }

      await tx.entry.update({
        where: { id: entryId },
        data: {
          ...(title !== undefined ? { title: title || null } : {}),
          ...(content !== undefined ? { content } : {}),
          ...(coverImage !== undefined ? { coverImage: coverImage || null } : {}),
          ...(sourceLanguage !== undefined ? { sourceLanguageId: sourceLanguage || null } : {}),
          ...(targetLanguage !== undefined ? { targetLanguageId: targetLanguage || null } : {}),
          ...(expressionType !== undefined ? { expressionType: expressionType || null } : {}),
          ...(tone !== undefined ? { tone: tone || null } : {}),
          ...(completeness !== undefined ? { completeness: completeness || null } : {}),
          ...(visibility !== undefined ? { visibility: visibility as any } : {}),
        },
      });

      // Sync mirror Post
      const mirror = await tx.post.findUnique({ where: { id: entryId } });
      if (mirror) {
        await tx.post.update({
          where: { id: entryId },
          data: {
            ...(title !== undefined ? { title: title || null } : {}),
            ...(content !== undefined ? { content } : {}),
            ...(sourceLanguage !== undefined ? { sourceLanguageId: sourceLanguage || null } : {}),
            ...(targetLanguage !== undefined ? { targetLanguageId: targetLanguage || null } : {}),
            ...(expressionType !== undefined ? { expressionType: expressionType || null } : {}),
            ...(tone !== undefined ? { tone: tone || null } : {}),
            ...(completeness !== undefined ? { completeness: (completeness as any) || "COMPLETE" } : {}),
            ...(visibility !== undefined ? { visibility: (visibility as any) || "PUBLIC" } : {}),
          },
        });
      }
    });

    revalidatePath(`/posts/${entryId}`);
    revalidatePath("/feed");
    return { success: true };
  } catch (e: any) {
    const message = e?.message || "";
    if (message === "ENTRY_NOT_FOUND") {
      return { errors: { _form: ["瞬间不存在"] } };
    }
    if (message === "NOT_AUTHOR") {
      return { errors: { _form: ["只有作者可以编辑自己的瞬间"] } };
    }
    console.error("updateEntryAction error:", e);
    return { errors: { _form: ["更新失败，请稍后再试"] } };
  }
}

// ─── Delete ──────────────────────────────────────────

export async function deleteEntryAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: ActionErrors; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const entryId = formData.get("entryId") as string;
  if (!entryId) {
    return { errors: { _form: ["参数错误"] } };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const entry = await tx.entry.findUnique({ where: { id: entryId }, select: { authorId: true } });
      if (!entry) throw new Error("ENTRY_NOT_FOUND");
      if (entry.authorId !== user.id) throw new Error("NOT_AUTHOR");

      await tx.entry.update({
        where: { id: entryId },
        data: { status: "DRAFT", visibility: "PRIVATE" },
      });

      const mirror = await tx.post.findUnique({ where: { id: entryId } });
      if (mirror) {
        await tx.post.update({
          where: { id: entryId },
          data: { status: "DELETED", visibility: "PRIVATE" },
        });
      }
    });

    revalidatePath("/feed");
    revalidatePath("/library");
    return { success: true };
  } catch (e: any) {
    const message = e?.message || "";
    if (message === "ENTRY_NOT_FOUND") {
      return { errors: { _form: ["瞬间不存在"] } };
    }
    if (message === "NOT_AUTHOR") {
      return { errors: { _form: ["只有作者可以删除自己的瞬间"] } };
    }
    console.error("deleteEntryAction error:", e);
    return { errors: { _form: ["删除失败，请稍后再试"] } };
  }
}
