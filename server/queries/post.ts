import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

const POST_LIST_PAGE_SIZE = 12;

const postCardSelect = {
  id: true,
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
  _count: { select: { corrections: { where: { status: { notIn: ["DELETED"] } } } } },
  corrections: {
    select: { isAccepted: true },
    where: { status: { notIn: ["DELETED"] } },
  },
} satisfies Prisma.PostSelect;

export type PostCardData = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

// ─── Feed query ──────────────────────────────────────

type FeedTab = "latest" | "awaiting" | "has_corrections" | "adopted";

export async function getFeedPosts({
  tab = "latest",
  completeness,
  cursor,
  limit = POST_LIST_PAGE_SIZE,
}: {
  tab?: FeedTab;
  completeness?: string;
  cursor?: string;
  limit?: number;
}) {
  const where: Prisma.PostWhereInput = {
    status: { in: ["PUBLISHED", "ACCEPTED"] },
    visibility: "PUBLIC",
  };

  if (completeness === "COMPLETE" || completeness === "PARTIAL" || completeness === "IDEA_ONLY") {
    where.completeness = completeness;
  }

  switch (tab) {
    case "awaiting":
      // Posts with zero published corrections
      where.corrections = { none: { status: { notIn: ["DELETED"] } } };
      break;
    case "has_corrections":
      // Posts with corrections but none adopted
      where.corrections = {
        some: {
          status: { notIn: ["DELETED"] },
          isAccepted: false,
        },
      };
      where.AND = {
        corrections: {
          none: { isAccepted: true, status: { notIn: ["DELETED"] } },
        },
      };
      break;
    case "adopted":
      // Posts with at least one adopted correction
      where.corrections = {
        some: { isAccepted: true, status: { notIn: ["DELETED"] } },
      };
      break;
    default: // "latest"
      break;
  }

  const posts = await prisma.post.findMany({
    where,
    select: postCardSelect,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = posts.length > limit;
  if (hasMore) posts.pop();

  return {
    posts: posts.map(formatPostCard),
    nextCursor: hasMore ? posts[posts.length - 1]?.id : null,
  };
}

// ─── Post detail ─────────────────────────────────────

const postDetailSelect = {
  id: true,
  title: true,
  content: true,
  expressionType: true,
  completeness: true,
  tone: true,
  visibility: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
  sourceLanguage: { select: { id: true, code: true, name: true, nativeName: true } },
  targetLanguage: { select: { id: true, code: true, name: true, nativeName: true } },
  corrections: {
    where: { status: { notIn: ["DELETED"] } },
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
  },
  _count: { select: { corrections: { where: { status: { notIn: ["DELETED"] } } } } },
} satisfies Prisma.PostSelect;

export type PostDetailData = Prisma.PostGetPayload<{ select: typeof postDetailSelect }>;

export async function getPostById(id: string) {
  const post = await prisma.post.findUnique({
    where: { id },
    select: postDetailSelect,
  });
  if (!post) return null;
  if (post.status === "DELETED") return null;
  return post;
}

// ─── Helpers ─────────────────────────────────────────

function formatPostCard(post: PostCardData) {
  const displayName =
    post.author.profile?.displayName || post.author.username;
  const hasAdoptedCorrection = post.corrections.some((c) => c.isAccepted);

  return {
    id: post.id,
    title: post.title,
    content:
      post.content.length > 200
        ? post.content.slice(0, 200) + "..."
        : post.content,
    expressionType: post.expressionType,
    completeness: post.completeness,
    visibility: post.visibility,
    status: post.status,
    createdAt: post.createdAt.toISOString(),
    author: {
      id: post.author.id,
      username: post.author.username,
      displayName,
      avatarUrl: post.author.profile?.avatarUrl ?? null,
    },
    targetLanguage: post.targetLanguage,
    correctionCount: post._count.corrections,
    hasAdoptedCorrection,
  };
}
