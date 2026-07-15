"use server";

import { prisma } from "@/lib/prisma";

export async function getLibraryStats(userId: string) {
  const [total, weekNew, reviewed, pending] = await Promise.all([
    prisma.expressionCollectionItem.count({ where: { userId } }),
    prisma.expressionCollectionItem.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    }),
    prisma.expressionCollectionItem.count({
      where: { userId, reviewStatus: { not: null } },
    }),
    prisma.expressionCollectionItem.count({
      where: { userId, reviewStatus: null },
    }),
  ]);

  return { total, weekNew, reviewed, pending };
}

export async function getReviewRecommendations(userId: string, limit = 5) {
  const items = await prisma.expressionCollectionItem.findMany({
    where: { userId },
    orderBy: [
      { lastReviewedAt: { sort: "asc", nulls: "first" } },
      { reviewCount: "asc" },
      { createdAt: "desc" },
    ],
    take: limit,
    include: {
      post: { select: { expressionType: true, tone: true, content: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    originalTextSnapshot: item.originalTextSnapshot,
    correctedTextSnapshot: item.correctedTextSnapshot,
    explanationSnapshot: item.explanationSnapshot,
    toneNoteSnapshot: item.toneNoteSnapshot,
    tags: item.tags as string[],
    reviewStatus: item.reviewStatus,
    reviewCount: item.reviewCount,
    lastReviewedAt: item.lastReviewedAt?.toISOString() || null,
    createdAt: item.createdAt.toISOString(),
    postExpressionType: item.post?.expressionType,
    postTone: item.post?.tone,
    postContent: item.post?.content,
  }));
}
