import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { entryCardSelect, formatEntryCard } from "./entry";

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username, status: "ACTIVE" },
    include: {
      profile: {
        include: {
          nativeLanguage: true,
          learningLanguage: true,
        },
      },
      _count: {
        select: {
          posts: { where: { status: { notIn: ["DELETED"] } } },
          corrections: { where: { status: { notIn: ["DELETED"] } } },
        },
      },
    },
  });
}

export async function getUserProfileStats(username: string) {
  const user = await prisma.user.findUnique({
    where: { username, status: "ACTIVE" },
    include: {
      profile: true,
    },
  });
  if (!user) return null;

  const [postCount, correctionCount, adoptedCount] = await Promise.all([
    prisma.post.count({
      where: { authorId: user.id, status: { notIn: ["DELETED"] } },
    }),
    prisma.correction.count({
      where: { authorId: user.id, status: { notIn: ["DELETED"] } },
    }),
    prisma.correction.count({
      where: { authorId: user.id, isAccepted: true, status: { notIn: ["DELETED"] } },
    }),
  ]);

  return {
    postCount,
    correctionCount,
    adoptedCount,
    reputationScore: user.profile?.reputationScore ?? 0,
  };
}

export async function getLanguages() {
  return prisma.language.findMany({ orderBy: { code: "asc" } });
}

export async function getUserPosts(userId: string) {
  return prisma.post.findMany({
    where: { authorId: userId, status: { notIn: ["HIDDEN", "DELETED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      targetLanguage: { select: { nativeName: true } },
      _count: { select: { corrections: { where: { status: { notIn: ["DELETED"] } } } } },
    },
    take: 20,
  });
}

export async function getUserCorrections(userId: string) {
  return prisma.correction.findMany({
    where: { authorId: userId, status: { notIn: ["HIDDEN", "DELETED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true, content: true } },
    },
    take: 20,
  });
}

export async function getUserAdoptedCorrections(userId: string) {
  return prisma.correction.findMany({
    where: { authorId: userId, isAccepted: true, status: { notIn: ["HIDDEN", "DELETED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { id: true, title: true, content: true } },
    },
    take: 20,
  });
}

const PROFILE_PAGE_SIZE = 12;

export type UserEntryType = "all" | "moment" | "article" | "draft";

export async function getUserEntryStats(userId: string, isOwner: boolean) {
  const baseWhere: Prisma.EntryWhereInput = { authorId: userId };
  if (!isOwner) {
    baseWhere.visibility = "PUBLIC";
    baseWhere.status = "PUBLISHED";
  }

  const [allMoments, allArticles, drafts] = await Promise.all([
    prisma.entry.count({
      where: { ...baseWhere, type: "MOMENT", ...(isOwner ? {} : {}) },
    }),
    prisma.entry.count({
      where: { ...baseWhere, type: "ARTICLE" },
    }),
    isOwner
      ? prisma.entry.count({
          where: { authorId: userId, status: "DRAFT" },
        })
      : Promise.resolve(0),
  ]);

  return { momentCount: allMoments, articleCount: allArticles, draftCount: drafts };
}

export async function getUserAvailableYears(userId: string, isOwner: boolean) {
  const where: Prisma.EntryWhereInput = { authorId: userId };
  if (!isOwner) {
    where.visibility = "PUBLIC";
    where.status = "PUBLISHED";
  }

  const entries = await prisma.entry.findMany({
    where,
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const years = new Set<number>();
  for (const e of entries) {
    years.add(e.createdAt.getFullYear());
  }
  return Array.from(years).sort((a, b) => b - a);
}

export async function getUserEntries({
  userId,
  viewerId,
  type = "all",
  year,
  month,
  cursor,
  limit = PROFILE_PAGE_SIZE,
}: {
  userId: string;
  viewerId?: string;
  type?: UserEntryType;
  year?: number;
  month?: number;
  cursor?: string;
  limit?: number;
}) {
  const isOwner = viewerId === userId;

  const where: Prisma.EntryWhereInput = { authorId: userId };

  if (type === "draft") {
    where.status = "DRAFT";
    if (!isOwner) return { entries: [], nextCursor: null };
  } else {
    if (isOwner) {
      where.OR = [
        { status: "PUBLISHED" },
        { status: "DRAFT" },
      ];
    } else {
      where.status = "PUBLISHED";
      where.visibility = "PUBLIC";
    }

    if (type === "moment") {
      where.type = "MOMENT";
    } else if (type === "article") {
      where.type = "ARTICLE";
    }
  }

  if (year !== undefined) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);
    where.createdAt = { gte: startOfYear, lt: endOfYear };
  }

  if (month !== undefined && year !== undefined) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);
    where.createdAt = { gte: startOfMonth, lt: endOfMonth };
  }

  const entries = await prisma.entry.findMany({
    where,
    select: entryCardSelect,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  if (hasMore) entries.pop();

  const momentIds = entries.filter((e) => e.type === "MOMENT").map((e) => e.id);

  let countMap = new Map<string, number>();
  const adoptedIds = new Set<string>();

  if (momentIds.length > 0) {
    const [counts, corrections] = await Promise.all([
      prisma.correction.groupBy({
        by: ["postId"],
        where: { postId: { in: momentIds }, status: { notIn: ["DELETED"] } },
        _count: { id: true },
      }),
      prisma.correction.findMany({
        where: { postId: { in: momentIds }, status: { notIn: ["DELETED"] } },
        select: { postId: true, isAccepted: true },
      }),
    ]);

    countMap = new Map(counts.map((c) => [c.postId, c._count.id]));
    for (const c of corrections) {
      if (c.isAccepted) adoptedIds.add(c.postId);
    }
  }

  return {
    entries: entries.map((e) => formatEntryCard(e, countMap.get(e.id) ?? 0, adoptedIds.has(e.id))),
    nextCursor: hasMore ? entries[entries.length - 1]?.id : null,
  };
}
