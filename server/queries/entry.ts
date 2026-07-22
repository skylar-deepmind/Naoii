import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ENTRY_LIST_PAGE_SIZE = 12;

// ─── Feed query ──────────────────────────────────────

const entryCardSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  coverImage: true,
  expressionType: true,
  completeness: true,
  visibility: true,
  status: true,
  tags: true,
  createdAt: true,
  publishedAt: true,
  author: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  targetLanguage: { select: { id: true, name: true, nativeName: true } },
} satisfies Prisma.EntrySelect;

export type EntryCardData = Prisma.EntryGetPayload<{ select: typeof entryCardSelect }>;

type FeedTab = "latest" | "awaiting" | "has_corrections" | "adopted";
type ContentType = "all" | "moment" | "article";

export async function getFeedEntries({
  tab = "latest",
  contentType = "all",
  completeness,
  tag,
  cursor,
  sort = "latest",
  limit = ENTRY_LIST_PAGE_SIZE,
}: {
  tab?: FeedTab;
  contentType?: ContentType;
  completeness?: string;
  tag?: string;
  cursor?: string;
  sort?: string;
  limit?: number;
}) {
  const where: Prisma.EntryWhereInput = {
    status: "PUBLISHED",
    visibility: "PUBLIC",
  };

  // Content type filter
  if (contentType === "moment") {
    where.type = "MOMENT";
  } else if (contentType === "article") {
    where.type = "ARTICLE";
  }

  if (completeness === "COMPLETE" || completeness === "PARTIAL" || completeness === "IDEA_ONLY") {
    where.completeness = completeness;
  }

  const entries = await prisma.entry.findMany({
    where,
    select: entryCardSelect,
    orderBy: { createdAt: "desc" },
    take: tag ? limit * 3 : limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Tag filter (PostgreSQL JSON array)
  let filtered = entries;
  if (tag) {
    // Simple substring match for JSON tags array
    filtered = entries.filter((e) => {
      const tags = e.tags as string[] | null;
      return tags && Array.isArray(tags) && tags.includes(tag);
    });
    // Re-apply limit after filtering
    if (filtered.length > limit) filtered.length = limit;
  }

  // Fetch correction counts (only for MOMENT type entries)
  const momentIds = filtered.filter((e) => e.type === "MOMENT").map((e) => e.id);

  const correctionCounts = await prisma.correction.groupBy({
    by: ["postId"],
    where: {
      postId: { in: momentIds },
      status: { notIn: ["DELETED"] },
    },
    _count: { id: true },
  });

  const adoptedIds = new Set<string>();
  const correctableIds = new Set<string>();

  if (momentIds.length > 0) {
    const corrections = await prisma.correction.findMany({
      where: {
        postId: { in: momentIds },
        status: { notIn: ["DELETED"] },
      },
      select: { postId: true, isAccepted: true },
    });

    for (const c of corrections) {
      correctableIds.add(c.postId);
      if (c.isAccepted) adoptedIds.add(c.postId);
    }
  }

  // Apply tab filter (only for moments tab types)
  if (contentType !== "article") {
    switch (tab) {
      case "awaiting":
        filtered = filtered.filter((e) => e.type === "ARTICLE" || !correctableIds.has(e.id));
        break;
      case "has_corrections":
        filtered = filtered.filter((e) => e.type === "ARTICLE" || (correctableIds.has(e.id) && !adoptedIds.has(e.id)));
        break;
      case "adopted":
        filtered = filtered.filter((e) => e.type === "ARTICLE" || adoptedIds.has(e.id));
        break;
      default:
        break;
    }
  }

  const countMap = new Map(correctionCounts.map((c) => [c.postId, c._count.id]));

  // Hottest sort: fetch like counts and sort descending
  if (sort === "hottest" && filtered.length > 0) {
    const likeCounts = await prisma.entryLike.groupBy({
      by: ["entryId"],
      where: { entryId: { in: filtered.map((e) => e.id) } },
      _count: { id: true },
    });
    const likeMap = new Map(likeCounts.map((l) => [l.entryId, l._count.id]));
    filtered.sort((a, b) => (likeMap.get(b.id) ?? 0) - (likeMap.get(a.id) ?? 0));
  }

  const hasMore = filtered.length > limit;
  if (hasMore) filtered.pop();

  return {
    entries: filtered.map((e) => formatEntryCard(e, countMap.get(e.id) ?? 0, adoptedIds.has(e.id))),
    nextCursor: hasMore ? filtered[filtered.length - 1]?.id : null,
  };
}

// ─── Entry detail ────────────────────────────────────

const entryDetailSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  coverImage: true,
  expressionType: true,
  completeness: true,
  tone: true,
  visibility: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  author: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  sourceLanguage: { select: { id: true, code: true, name: true, nativeName: true } },
  targetLanguage: { select: { id: true, code: true, name: true, nativeName: true } },
} satisfies Prisma.EntrySelect;

export type EntryDetailData = Prisma.EntryGetPayload<{ select: typeof entryDetailSelect }>;

export async function getEntryById(id: string) {
  const entry = await prisma.entry.findUnique({
    where: { id },
    select: entryDetailSelect,
  });
  return entry;
}

export async function getEntryCorrections(entryId: string) {
  return prisma.correction.findMany({
    where: { postId: entryId, status: { notIn: ["DELETED"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      correctedText: true,
      explanation: true,
      toneNote: true,
      isAccepted: true,
      status: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });
}

export async function getEntryCorrectionCount(entryId: string) {
  return prisma.correction.count({
    where: { postId: entryId, status: { notIn: ["DELETED"] } },
  });
}

// ─── Helpers ─────────────────────────────────────────

function formatEntryCard(
  entry: EntryCardData,
  correctionCount: number,
  hasAdoptedCorrection: boolean
) {
  const displayName = entry.author.profile?.displayName || entry.author.username;

  return {
    id: entry.id,
    type: entry.type,
    title: entry.title,
    content:
      entry.content.length > 200
        ? entry.content.slice(0, 200) + "..."
        : entry.content,
    coverImage: entry.coverImage,
    expressionType: entry.expressionType,
    completeness: entry.completeness,
    visibility: entry.visibility,
    status: entry.status,
    tags: entry.tags as string[] | null,
    createdAt: entry.createdAt.toISOString(),
    publishedAt: entry.publishedAt?.toISOString() ?? null,
    author: {
      id: entry.author.id,
      username: entry.author.username,
      displayName,
      avatarUrl: entry.author.profile?.avatarUrl ?? null,
    },
    targetLanguage: entry.targetLanguage,
    correctionCount,
    hasAdoptedCorrection,
  };
}
