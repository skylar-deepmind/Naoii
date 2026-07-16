"use server";

import { prisma } from "@/lib/prisma";

// ─── Cache ────────────────────────────────────────

const cache = new Map<string, { data: any; expiry: number }>();
const TTL = 5 * 60 * 1000; // 5 min

function cacheGet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expiry > Date.now()) return Promise.resolve(entry.data as T);
  return fetcher().then((data) => {
    cache.set(key, { data, expiry: Date.now() + TTL });
    return data;
  });
}

// ─── Helpers ──────────────────────────────────────

async function getAdminIds(): Promise<string[]> {
  return (await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } })).map((u) => u.id);
}

function getDateRange(range: "today" | "7d" | "30d") {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  let start: Date;
  if (range === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "7d") {
    start = new Date(Date.now() - 7 * 86400000);
  } else {
    start = new Date(Date.now() - 30 * 86400000);
  }
  return { start, end };
}

// ─── Metrics ──────────────────────────────────────

export async function getAnalytics(range: "today" | "7d" | "30d") {
  const { start, end } = getDateRange(range);
  const key = `analytics:${range}`;

  return cacheGet(key, async () => {
    const adminIds = await getAdminIds();
    const notAdmin = (v: string) => ({ notIn: adminIds.length ? adminIds : [""] });
    const visible = { notIn: ["HIDDEN", "DELETED"] as any };

    const [newUsers, newPosts, newCorrections, closedLoop, savedCount, adoptedTotal, activeUsers] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: start, lt: end }, id: notAdmin("id"), status: "ACTIVE" } }),
      prisma.post.count({ where: { createdAt: { gte: start, lt: end }, status: visible, authorId: notAdmin("authorId") } }),
      prisma.correction.count({ where: { createdAt: { gte: start, lt: end }, status: visible, authorId: notAdmin("authorId") } }),
      prisma.post.count({ where: { createdAt: { gte: start, lt: end }, status: "ACCEPTED", authorId: notAdmin("authorId") } }),
      prisma.expressionCollectionItem.count({ where: { createdAt: { gte: start, lt: end }, userId: notAdmin("userId") } }),
      prisma.correction.count({ where: { acceptedAt: { gte: start, lt: end }, isAccepted: true, status: visible } }),
      getActiveUserCount(start, end, adminIds),
    ]);

    const feedbackCoverage = await getFeedbackCoverage(start, end, adminIds);
    const medianTime = await getMedianFirstFeedbackTime(start, end, adminIds);
    const postsWithCorrections = await prisma.post.count({
      where: { createdAt: { gte: start, lt: end }, status: visible, authorId: notAdmin("authorId"), corrections: { some: { status: visible } } },
    });
    const closedLoopRate = postsWithCorrections > 0 ? closedLoop / postsWithCorrections : 0;
    const librarySaveRate = adoptedTotal > 0 ? savedCount / adoptedTotal : 0;

    return { newUsers, activeUsers, newPosts, newCorrections, feedbackCoverage24h: feedbackCoverage, medianFirstFeedbackMin: medianTime, closedLoop, closedLoopRate, librarySaveRate };
  });
}

export async function getDailyTrend(range: "today" | "7d" | "30d", metric: string) {
  const { start, end } = getDateRange(range);
  const key = `trend:${range}:${metric}`;

  return cacheGet(key, async () => {
    const adminIds = await getAdminIds();
    const aNot = adminIds.length ? `"authorId" NOT IN (${adminIds.map((_, i) => `$${i + 3}`).join(",")})` : "TRUE";
    const uNot = adminIds.length ? `"userId" NOT IN (${adminIds.map((_, i) => `$${i + 3}`).join(",")})` : "TRUE";
    const idNot = adminIds.length ? `"id" NOT IN (${adminIds.map((_, i) => `$${i + 3}`).join(",")})` : "TRUE";

    // Re-run getAdminIds to have fresh params
    const a = adminIds;

    if (metric === "new_users") return aggregateByDay(start, end, "User", `${idNot} AND "status" = 'ACTIVE'`, a);
    if (metric === "new_posts") return aggregateByDay(start, end, "Post", `${aNot} AND "status" NOT IN ('HIDDEN','DELETED')`, a);
    if (metric === "new_corrections") return aggregateByDay(start, end, "Correction", `${aNot} AND "status" NOT IN ('HIDDEN','DELETED')`, a);
    if (metric === "closed_loop") return aggregateByDay(start, end, "Post", `${aNot} AND "status" = 'ACCEPTED'`, a);
    if (metric === "active_users") return getActiveUserTrend(start, end, a);
    return [];
  });
}

export async function getFunnel(range: "today" | "7d" | "30d") {
  const { start, end } = getDateRange(range);
  const key = `funnel:${range}`;

  return cacheGet(key, async () => {
    const adminIds = await getAdminIds();
    const notAdmin = (v: string) => ({ notIn: adminIds.length ? adminIds : [""] });
    const visible = { notIn: ["HIDDEN", "DELETED"] as any };

    const [posts, corrected, accepted, saved] = await Promise.all([
      prisma.post.count({ where: { createdAt: { gte: start, lt: end }, status: visible, authorId: notAdmin("authorId") } }),
      prisma.post.count({ where: { createdAt: { gte: start, lt: end }, status: visible, authorId: notAdmin("authorId"), corrections: { some: { status: visible } } } }),
      prisma.post.count({ where: { createdAt: { gte: start, lt: end }, status: "ACCEPTED", authorId: notAdmin("authorId") } }),
      prisma.expressionCollectionItem.count({ where: { createdAt: { gte: start, lt: end }, userId: notAdmin("userId") } }),
    ]);

    return { posts, corrected, accepted, saved };
  });
}

// ─── Internal ─────────────────────────────────────

async function getActiveUserCount(start: Date, end: Date, adminIds: string[]): Promise<number> {
  // Use Prisma queries with dedup in JS — simpler and avoids SQL param issues
  const [postUsers, correctionUsers, libraryUsers] = await Promise.all([
    prisma.post.findMany({
      where: { createdAt: { gte: start, lt: end }, status: { notIn: ["HIDDEN", "DELETED"] }, authorId: adminIds.length ? { notIn: adminIds } : undefined },
      select: { authorId: true }, distinct: ["authorId"],
    }),
    prisma.correction.findMany({
      where: { createdAt: { gte: start, lt: end }, status: { notIn: ["HIDDEN", "DELETED"] }, authorId: adminIds.length ? { notIn: adminIds } : undefined },
      select: { authorId: true }, distinct: ["authorId"],
    }),
    prisma.expressionCollectionItem.findMany({
      where: { createdAt: { gte: start, lt: end }, userId: adminIds.length ? { notIn: adminIds } : undefined },
      select: { userId: true }, distinct: ["userId"],
    }),
  ]);

  const allIds = new Set<string>();
  for (const p of postUsers) allIds.add(p.authorId);
  for (const c of correctionUsers) allIds.add(c.authorId);
  for (const l of libraryUsers) allIds.add(l.userId);
  return allIds.size;
}

async function getFeedbackCoverage(start: Date, end: Date, adminIds: string[]): Promise<number> {
  const cutoff = new Date(end.getTime() - 86400000);
  if (cutoff <= start) return 0;

  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: start, lt: cutoff },
      status: { notIn: ["HIDDEN", "DELETED"] },
      authorId: adminIds.length ? { notIn: adminIds } : undefined,
    },
    select: { id: true, createdAt: true },
  });

  if (posts.length === 0) return 0;

  let covered = 0;
  // Check each post for a correction within 24h
  for (const post of posts) {
    const firstCorrection = await prisma.correction.findFirst({
      where: { postId: post.id, status: { notIn: ["HIDDEN", "DELETED"] } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    if (firstCorrection && firstCorrection.createdAt.getTime() - post.createdAt.getTime() <= 86400000) {
      covered++;
    }
  }

  return covered / posts.length;
}

async function getMedianFirstFeedbackTime(start: Date, end: Date, adminIds: string[]): Promise<number> {
  // Fetch all posts and their first correction time, compute median in JS
  const posts = await prisma.post.findMany({
    where: {
      createdAt: { gte: start, lt: end },
      status: { notIn: ["HIDDEN", "DELETED"] },
      authorId: adminIds.length ? { notIn: adminIds } : undefined,
    },
    select: { id: true, createdAt: true },
    take: 500,
  });

  const diffs: number[] = [];
  for (const post of posts) {
    const first = await prisma.correction.findFirst({
      where: { postId: post.id, status: { notIn: ["HIDDEN", "DELETED"] } },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    if (first) {
      diffs.push((first.createdAt.getTime() - post.createdAt.getTime()) / 60000); // minutes
    }
  }

  if (diffs.length === 0) return 0;
  diffs.sort((a, b) => a - b);
  const mid = Math.floor(diffs.length / 2);
  return diffs.length % 2 === 0 ? Math.round((diffs[mid - 1] + diffs[mid]) / 2) : Math.round(diffs[mid]);
}

async function aggregateByDay(start: Date, end: Date, table: string, extraCondition: string, params: any[]) {
  const result: any[] = await prisma.$queryRawUnsafe(
    `SELECT DATE("createdAt") as date, COUNT(*)::int as count
     FROM "${table}"
     WHERE "createdAt" >= $1 AND "createdAt" < $2 ${extraCondition ? "AND " + extraCondition : ""}
     GROUP BY DATE("createdAt")
     ORDER BY date`,
    start, end, ...params,
  );

  const dateMap = new Map<string, number>();
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    dateMap.set(d.toISOString().slice(0, 10), 0);
  }

  for (const r of result) {
    const dateStr = typeof r.date === "string" ? r.date : new Date(r.date).toISOString().slice(0, 10);
    dateMap.set(dateStr, Number(r.count));
  }

  return Array.from(dateMap.entries()).map(([date, count]) => ({ date, count }));
}

async function getActiveUserTrend(start: Date, end: Date, adminIds: string[]) {
  const days: { date: string; count: number }[] = [];
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const dayStart = new Date(d);
    const dayEnd = new Date(d); dayEnd.setDate(dayEnd.getDate() + 1);
    days.push({ date: d.toISOString().slice(0, 10), count: await getActiveUserCount(dayStart, dayEnd, adminIds) });
  }
  return days;
}
