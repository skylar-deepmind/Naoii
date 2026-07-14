"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const reportSchema = z.object({
  postId: z.string().optional(),
  correctionId: z.string().optional(),
  reason: z.enum(["SPAM", "HARASSMENT", "INAPPROPRIATE_CONTENT", "OTHER"]),
  description: z.string().max(500).optional(),
});

export async function createReportAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) {
    return { errors: { _form: ["请先登录"] } };
  }

  const raw = Object.fromEntries(formData);
  const parsed = reportSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { postId, correctionId, reason, description } = parsed.data;

  if (!postId && !correctionId) {
    return { errors: { _form: ["请指定举报对象"] } };
  }

  try {
    // Check duplicate
    const existing = await prisma.report.findFirst({
      where: {
        reporterId: user.id,
        postId: postId || null,
        correctionId: correctionId || null,
        status: "PENDING",
      },
    });
    if (existing) {
      return { errors: { _form: ["你已经举报过了，请等待处理"] } };
    }

    await prisma.report.create({
      data: {
        reporterId: user.id,
        postId: postId || null,
        correctionId: correctionId || null,
        reason,
        description: description || null,
      },
    });

    return { success: true };
  } catch (e: any) {
    console.error("createReportAction error:", e);
    return { errors: { _form: ["举报失败，请稍后再试"] } };
  }
}
