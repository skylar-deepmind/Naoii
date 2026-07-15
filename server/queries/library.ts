"use server";

import { prisma } from "@/lib/prisma";

export async function getLibraryItems(userId: string) {
  return prisma.expressionCollectionItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: { id: true, title: true, content: true },
      },
    },
  });
}

export async function getRelatedLibraryItems({
  userId,
  expressionType,
  tone,
  targetLanguageId,
  limit = 3,
}: {
  userId: string;
  expressionType?: string;
  tone?: string;
  targetLanguageId?: string;
  limit?: number;
}) {
  if (!expressionType && !tone && !targetLanguageId) return [];

  const items = await prisma.expressionCollectionItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          expressionType: true,
          tone: true,
          targetLanguageId: true,
        },
      },
    },
    take: 50, // fetch recent 50, score in JS
  });

  // Score and filter
  const scored = items
    .map((item) => {
      let score = 0;
      const pt = item.post;
      if (pt?.expressionType && pt.expressionType === expressionType) score += 4;
      if (pt?.tone && tone && pt.tone === tone) score += 3;
      if (pt?.targetLanguageId && pt.targetLanguageId === targetLanguageId) score += 2;
      // Recency bonus
      const daysAgo = (Date.now() - new Date(item.createdAt).getTime()) / 86400000;
      if (daysAgo < 7) score += 1;
      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => ({
    id: s.item.id,
    correctedTextSnapshot: s.item.correctedTextSnapshot,
    explanationSnapshot: s.item.explanationSnapshot,
    toneNoteSnapshot: s.item.toneNoteSnapshot,
    tags: s.item.tags as string[],
    createdAt: s.item.createdAt.toISOString(),
    postId: s.item.postId,
    postExpressionType: s.item.post?.expressionType,
    postTone: s.item.post?.tone,
    score: s.score,
  }));
}
