"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type ActionResult = { errors?: Record<string, string[]>; success?: boolean };

async function requireAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };
  if (user.role !== "ADMIN") return { errors: { _form: ["需要管理员权限"] } };
  return null;
}

async function logAction(action: string, targetType: string, targetId?: string, details?: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.adminActionLog.create({
    data: { adminId: user.id, action, targetType, targetId: targetId || null, details: details || null },
  });
}

function getString(formData: FormData, key: string): string {
  return (formData.get(key) as string) || "";
}

// ─── Reports ────────────────────────────────────────

export async function resolveReportAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const reportId = getString(formData, "reportId");
  if (!reportId) return { errors: { _form: ["缺少报告 ID"] } };

  await prisma.report.update({ where: { id: reportId }, data: { status: "RESOLVED", resolvedById: (await getCurrentUser())!.id, resolvedAt: new Date() } });
  await logAction("resolve_report", "report", reportId);
  revalidatePath("/admin");
  return { success: true };
}

export async function dismissReportAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const reportId = getString(formData, "reportId");
  if (!reportId) return { errors: { _form: ["缺少报告 ID"] } };

  await prisma.report.update({ where: { id: reportId }, data: { status: "DISMISSED", resolvedById: (await getCurrentUser())!.id, resolvedAt: new Date() } });
  await logAction("dismiss_report", "report", reportId);
  revalidatePath("/admin");
  return { success: true };
}

// ─── Posts ──────────────────────────────────────────

export async function hidePostAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const postId = getString(formData, "postId");
  if (!postId) return { errors: { _form: ["缺少帖子 ID"] } };

  await prisma.post.update({ where: { id: postId }, data: { status: "HIDDEN" } });
  await logAction("hide_post", "post", postId);
  revalidatePath("/admin");
  return { success: true };
}

export async function restorePostAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const postId = getString(formData, "postId");
  if (!postId) return { errors: { _form: ["缺少帖子 ID"] } };

  await prisma.post.update({ where: { id: postId }, data: { status: "PUBLISHED" } });
  await logAction("restore_post", "post", postId);
  revalidatePath("/admin");
  return { success: true };
}

// ─── Corrections ────────────────────────────────────

export async function hideCorrectionAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const correctionId = getString(formData, "correctionId");
  if (!correctionId) return { errors: { _form: ["缺少修改 ID"] } };

  await prisma.correction.update({ where: { id: correctionId }, data: { status: "HIDDEN" } });
  await logAction("hide_correction", "correction", correctionId);
  revalidatePath("/admin");
  return { success: true };
}

export async function restoreCorrectionAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const correctionId = getString(formData, "correctionId");
  if (!correctionId) return { errors: { _form: ["缺少修改 ID"] } };

  await prisma.correction.update({ where: { id: correctionId }, data: { status: "PUBLISHED" } });
  await logAction("restore_correction", "correction", correctionId);
  revalidatePath("/admin");
  return { success: true };
}

// ─── Users ──────────────────────────────────────────

export async function banUserAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const userId = getString(formData, "userId");
  if (!userId) return { errors: { _form: ["缺少用户 ID"] } };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (target?.role === "ADMIN") return { errors: { _form: ["不能封禁管理员"] } };

  await prisma.user.update({ where: { id: userId }, data: { status: "BANNED" } });
  await logAction("ban_user", "user", userId);
  revalidatePath("/admin");
  return { success: true };
}

export async function unbanUserAction(formData: FormData): Promise<ActionResult> {
  const err = await requireAdmin(); if (err) return err;
  const userId = getString(formData, "userId");
  if (!userId) return { errors: { _form: ["缺少用户 ID"] } };

  await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  await logAction("unban_user", "user", userId);
  revalidatePath("/admin");
  return { success: true };
}
