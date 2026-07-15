"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function acceptCorrectionAction(
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
    await prisma.$transaction(async (tx) => {
      // 1. Fetch the correction
      const correction = await tx.correction.findUnique({
        where: { id: correctionId },
        include: { post: true },
      });

      if (!correction) throw new Error("CORRECTION_NOT_FOUND");
      if (correction.postId !== postId) throw new Error("POST_MISMATCH");

      // 2. Verify the current user is the post author
      if (correction.post.authorId !== user.id) {
        throw new Error("NOT_AUTHOR");
      }

      // 3. Check if this correction is already accepted
      if (correction.isAccepted) {
        throw new Error("ALREADY_ACCEPTED");
      }

      // 4. Check if the post already has an accepted correction
      const alreadyAccepted = await tx.correction.findFirst({
        where: { postId, isAccepted: true, status: { not: "DELETED" } },
      });
      if (alreadyAccepted) {
        throw new Error("POST_ALREADY_ACCEPTED");
      }

      // 5. Accept the correction
      await tx.correction.update({
        where: { id: correctionId },
        data: { isAccepted: true },
      });

      // 6. Update post status
      await tx.post.update({
        where: { id: postId },
        data: { status: "ACCEPTED" },
      });

      // 7. Add reputation (+10) to the correction author
      const REPUTATION_POINTS = 10;
      await tx.reputationLog.create({
        data: {
          userId: correction.authorId,
          points: REPUTATION_POINTS,
          reason: "修改建议被采纳",
          sourceType: "correction_accepted",
          sourceId: correctionId,
        },
      });

      // 8. Increment UserProfile.reputationScore
      await tx.userProfile.update({
        where: { userId: correction.authorId },
        data: { reputationScore: { increment: REPUTATION_POINTS } },
      });

      // 9. Notify the correction author
      await tx.notification.create({
        data: {
          userId: correction.authorId,
          type: "CORRECTION_ADOPTED",
          title: "你的修改建议被采纳了",
          body: `你对帖子的修改建议已被作者采纳，获得 +${REPUTATION_POINTS} 声望`,
          relatedPostId: postId,
          relatedCorrectionId: correctionId,
        },
      });
    });

    revalidatePath(`/posts/${postId}`);
    revalidatePath("/feed");
    return { success: true };
  } catch (e: any) {
    const message = e?.message || "";
    if (message === "NOT_AUTHOR") {
      return { errors: { _form: ["只有帖子作者可以采纳修改建议"] } };
    }
    if (message === "ALREADY_ACCEPTED") {
      return { errors: { _form: ["这条修改建议已经被采纳了"] } };
    }
    if (message === "POST_ALREADY_ACCEPTED") {
      return { errors: { _form: ["这篇帖子已经采纳过修改建议了"] } };
    }
    if (message === "CORRECTION_NOT_FOUND" || message === "POST_MISMATCH") {
      return { errors: { _form: ["参数错误"] } };
    }
    return { errors: { _form: ["操作失败，请稍后再试"] } };
  }
}
