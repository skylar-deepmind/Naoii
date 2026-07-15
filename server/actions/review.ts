"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markReviewAction(
  _prev: unknown,
  formData: FormData
): Promise<{ errors?: Record<string, string[]>; success?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { errors: { _form: ["请先登录"] } };

  const itemId = formData.get("itemId") as string;
  const status = formData.get("status") as string; // "mastered" | "review" | "skip"

  if (!itemId || !status) return { errors: { _form: ["参数错误"] } };

  const item = await prisma.expressionCollectionItem.findUnique({ where: { id: itemId } });
  if (!item || item.userId !== user.id) return { errors: { _form: ["收藏不存在"] } };

  await prisma.expressionCollectionItem.update({
    where: { id: itemId },
    data: {
      lastReviewedAt: new Date(),
      reviewStatus: status,
      reviewCount: { increment: 1 },
    },
  });

  revalidatePath("/library");
  return { success: true };
}
