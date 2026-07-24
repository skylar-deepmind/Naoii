"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

const createTopicSchema = z.object({
  name: z.string().min(1, "请输入话题名称").max(100),
  slug: z
    .string()
    .min(1, "请输入 URL 标识")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL 标识只能包含小写字母、数字和连字符"),
  description: z.string().min(1, "请输入简介").max(500),
  coverImage: z.string().max(500).optional(),
  isPermanent: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventDescription: z.string().max(2000).optional(),
});

const updateTopicSchema = z.object({
  topicId: z.string().min(1),
  name: z.string().min(1, "请输入话题名称").max(100),
  slug: z
    .string()
    .min(1, "请输入 URL 标识")
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL 标识只能包含小写字母、数字和连字符"),
  description: z.string().min(1, "请输入简介").max(500),
  coverImage: z.string().max(500).optional(),
  isPermanent: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  eventDescription: z.string().max(2000).optional(),
});

// ─── Create ──────────────────────────────────────────

export async function createTopicAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const err = await requireAdmin();
  if (err) return err;

  const raw = Object.fromEntries(formData);
  const parsed = createTopicSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { name, slug, description, coverImage, isPermanent, startTime, endTime, eventDescription } = parsed.data;
  const permanent = isPermanent !== "false";

  // Check slug uniqueness
  const existing = await prisma.topic.findUnique({ where: { slug } });
  if (existing) {
    return { errors: { slug: ["该 URL 标识已被占用"] } };
  }

  try {
    await prisma.topic.create({
      data: {
        name,
        slug,
        description,
        coverImage: coverImage || null,
        isPermanent: permanent,
        startTime: permanent ? null : (startTime ? new Date(startTime) : null),
        endTime: permanent ? null : (endTime ? new Date(endTime) : null),
        eventDescription: eventDescription || null,
        createdById: (await getCurrentUser())!.id,
      },
    });
    await logAction("create_topic", "topic");
    revalidatePath("/admin/topics");
    revalidatePath("/topics");
    return { success: true };
  } catch {
    return { errors: { _form: ["创建失败"] } };
  }
}

// ─── Update ──────────────────────────────────────────

export async function updateTopicAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const err = await requireAdmin();
  if (err) return err;

  const raw = Object.fromEntries(formData);
  const parsed = updateTopicSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { topicId, name, slug, description, coverImage, isPermanent, startTime, endTime, eventDescription } = parsed.data;
  const permanent = isPermanent !== "false";

  // Check slug uniqueness (excluding self)
  const existing = await prisma.topic.findFirst({ where: { slug, id: { not: topicId } } });
  if (existing) {
    return { errors: { slug: ["该 URL 标识已被占用"] } };
  }

  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: {
        name,
        slug,
        description,
        coverImage: coverImage || null,
        isPermanent: permanent,
        startTime: permanent ? null : (startTime ? new Date(startTime) : null),
        endTime: permanent ? null : (endTime ? new Date(endTime) : null),
        eventDescription: eventDescription || null,
      },
    });
    await logAction("update_topic", "topic", topicId);
    revalidatePath("/admin/topics");
    revalidatePath(`/admin/topics/${topicId}/edit`);
    revalidatePath("/topics");
    revalidatePath(`/topics/${slug}`);
    return { success: true };
  } catch {
    return { errors: { _form: ["更新失败"] } };
  }
}

// ─── Close / Reopen ──────────────────────────────────

export async function closeTopicAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const err = await requireAdmin();
  if (err) return err;

  const topicId = (formData.get("topicId") as string) || "";
  if (!topicId) return { errors: { _form: ["缺少话题 ID"] } };

  try {
    await prisma.topic.update({ where: { id: topicId }, data: { closedAt: new Date() } });
    await logAction("close_topic", "topic", topicId);
    revalidatePath("/admin/topics");
    revalidatePath("/topics");
    return { success: true };
  } catch {
    return { errors: { _form: ["操作失败"] } };
  }
}

export async function reopenTopicAction(
  _prev: unknown,
  formData: FormData
): Promise<ActionResult> {
  const err = await requireAdmin();
  if (err) return err;

  const topicId = (formData.get("topicId") as string) || "";
  if (!topicId) return { errors: { _form: ["缺少话题 ID"] } };

  try {
    await prisma.topic.update({ where: { id: topicId }, data: { closedAt: null } });
    await logAction("reopen_topic", "topic", topicId);
    revalidatePath("/admin/topics");
    revalidatePath("/topics");
    return { success: true };
  } catch {
    return { errors: { _form: ["操作失败"] } };
  }
}
