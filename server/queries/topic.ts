import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { entryCardSelect, formatEntryCard } from "./entry";

const TOPIC_PAGE_SIZE = 12;

// ─── Topic select ────────────────────────────────────

export const topicSelect = {
  id: true,
  name: true,
  slug: true,
  coverImage: true,
  description: true,
  isPermanent: true,
  startTime: true,
  endTime: true,
  eventDescription: true,
  closedAt: true,
  createdAt: true,
  createdBy: {
    select: { id: true, username: true },
  },
} satisfies Prisma.TopicSelect;

export type TopicData = Prisma.TopicGetPayload<{ select: typeof topicSelect }>;

// ─── Status computation ──────────────────────────────

export type TopicStatus = "ACTIVE" | "UPCOMING" | "ENDED" | "CLOSED";

export function getTopicStatus(topic: { closedAt: Date | null; isPermanent: boolean; startTime: Date | null; endTime: Date | null }): TopicStatus {
  if (topic.closedAt) return "CLOSED";
  if (topic.isPermanent) return "ACTIVE";
  const now = new Date();
  if (topic.startTime && now < topic.startTime) return "UPCOMING";
  if (topic.endTime && now > topic.endTime) return "ENDED";
  return "ACTIVE";
}

export function canPostToTopic(topic: { closedAt: Date | null; isPermanent: boolean; startTime: Date | null; endTime: Date | null }): boolean {
  const status = getTopicStatus(topic);
  return status === "ACTIVE";
}

// ─── List queries ────────────────────────────────────

export async function getAllTopics() {
  return prisma.topic.findMany({
    where: { closedAt: null },
    orderBy: { createdAt: "desc" },
    select: topicSelect,
  });
}

export async function getTopicsForAdmin() {
  return prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    select: topicSelect,
  });
}

export async function getActiveTopics() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    select: { ...topicSelect, _count: { select: { entries: { where: { status: "PUBLISHED", visibility: "PUBLIC" } } } } },
  });

  return topics
    .filter((t) => canPostToTopic(t))
    .map((t) => ({
      ...t,
      status: getTopicStatus(t),
      entryCount: t._count.entries,
    }));
}

// ─── Detail ──────────────────────────────────────────

export async function getTopicBySlug(slug: string) {
  const topic = await prisma.topic.findUnique({
    where: { slug },
    select: {
      ...topicSelect,
      _count: { select: { entries: { where: { status: "PUBLISHED", visibility: "PUBLIC" } } } },
    },
  });
  if (!topic) return null;
  return {
    ...topic,
    status: getTopicStatus(topic),
    entryCount: topic._count.entries,
  };
}

export async function getTopicEntries({
  topicId,
  cursor,
  limit = TOPIC_PAGE_SIZE,
}: {
  topicId: string;
  cursor?: string;
  limit?: number;
}) {
  const entries = await prisma.entry.findMany({
    where: {
      topicId,
      status: "PUBLISHED",
      visibility: "PUBLIC",
    },
    select: entryCardSelect,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  if (hasMore) entries.pop();

  const momentIds = entries.filter((e) => e.type === "MOMENT").map((e) => e.id);
  const correctionCounts = await prisma.correction.groupBy({
    by: ["postId"],
    where: { postId: { in: momentIds }, status: { notIn: ["DELETED"] } },
    _count: { id: true },
  });
  const countMap = new Map(correctionCounts.map((c) => [c.postId, c._count.id]));

  const adoptedIds = new Set<string>();
  if (momentIds.length > 0) {
    const corrections = await prisma.correction.findMany({
      where: { postId: { in: momentIds }, isAccepted: true, status: { notIn: ["DELETED"] } },
      select: { postId: true },
    });
    for (const c of corrections) adoptedIds.add(c.postId);
  }

  return {
    entries: entries.map((e) => formatEntryCard(e, countMap.get(e.id) ?? 0, adoptedIds.has(e.id))),
    nextCursor: hasMore ? entries[entries.length - 1]?.id : null,
  };
}

export async function getTopicParticipantCount(topicId: string) {
  const result = await prisma.entry.groupBy({
    by: ["authorId"],
    where: { topicId, status: "PUBLISHED", visibility: "PUBLIC" },
  });
  return result.length;
}
