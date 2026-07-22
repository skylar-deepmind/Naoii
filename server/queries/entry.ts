import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ENTRY_LIST_PAGE_SIZE = 12;

// ─── Feed query ──────────────────────────────────────

const entryCardSelect = {
  id: true,
  type: true,
  title: true,
  content: true,
  expressionType: true,
  completeness: true,
  visibility: true,
  status: true,
  createdAt: true,
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

export async function getFeedEntries({
  tab = "latest",
  completeness,
  cursor,
  limit = ENTRY_LIST_PAGE_SIZE,
}: {
  tab?: FeedTab;
  completeness?: string;
  cursor?: string;
  limit?: number;
}) {
  const where: Prisma.EntryWhereInput = {
    type: "MOMENT",
    status: "PUBLISHED",
    visibility: "PUBLIC",
  };

  if (completeness === "COMPLETE" || completeness === "PARTIAL" || completeness === "IDEA_ONLY") {
    where.completeness = completeness;
  }

  // For filtered tabs, we need to join with Correction via shared IDs
  // Since Entry.id == Post.id for mirrored records, we check corrections by postId == entryId
  if (tab !== "latest") {
    // Fetch entries + corrections count via raw or two-step query
    // For simplicity: fetch all entries matching basic filter, then filter in JS
  }

  const entries = await prisma.entry.findMany({
    where,
    select: entryCardSelect,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  // Fetch correction counts/lookups using the shared IDs (Entry.id == Post.id for mirrored records)
  const entryIds = entries.map((e) => e.id);

  // Count corrections for each entry (via Correction.postId which matches Entry.id)
  const correctionCounts = await prisma.correction.groupBy({
    by: ["postId"],
    where: {
      postId: { in: entryIds },
      status: { notIn: ["DELETED"] },
    },
    _count: { id: true },
  });

  const adoptedIds = new Set<string>();
  const correctableIds = new Set<string>();
  const correctedIds = new Set<string>();

  const corrections = await prisma.correction.findMany({
    where: {
      postId: { in: entryIds },
      status: { notIn: ["DELETED"] },
    },
    select: { postId: true, isAccepted: true },
  });

  for (const c of corrections) {
    correctableIds.add(c.postId);
    if (c.isAccepted) adoptedIds.add(c.postId);
    else correctedIds.add(c.postId);
  }

  // Apply tab filter
  let filtered = entries;
  switch (tab) {
    case "awaiting":
      filtered = entries.filter((e) => !correctableIds.has(e.id));
      break;
    case "has_corrections":
      filtered = entries.filter((e) => correctableIds.has(e.id) && !adoptedIds.has(e.id));
      break;
    case "adopted":
      filtered = entries.filter((e) => adoptedIds.has(e.id));
      break;
    default:
      break;
  }

  const countMap = new Map(correctionCounts.map((c) => [c.postId, c._count.id]));

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
  if (!entry || entry.status !== "PUBLISHED") return null;
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
    expressionType: entry.expressionType,
    completeness: entry.completeness,
    visibility: entry.visibility,
    status: entry.status,
    createdAt: entry.createdAt.toISOString(),
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
