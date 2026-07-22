import { prisma } from "@/lib/prisma";

export type CommentSort = "time_desc" | "time_asc" | "likes_desc" | "likes_asc";

const commentSelect = {
  id: true,
  body: true,
  likeCount: true,
  parentId: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
    },
  },
};

export async function getComments(entryId: string) {
  const all = await prisma.comment.findMany({
    where: { entryId },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });

  return all;
}

export async function getCommentsSorted(entryId: string, sort: CommentSort, currentUserId?: string, correctionId?: string) {
  const orderField = sort.startsWith("likes") ? "likeCount" : "createdAt";
  const orderDir = sort.endsWith("desc") ? "desc" : "asc";

  const where: any = correctionId ? { correctionId } : { entryId };
  if (!correctionId) where.entryId = entryId;

  const all = await prisma.comment.findMany({
    where,
    select: {
      ...commentSelect,
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
    orderBy: { [orderField]: orderDir },
  });

  // Build nested structure and sort children within each parent
  const parentComments = all.filter((c) => !c.parentId);
  const childComments = all.filter((c) => c.parentId);

  // Sort parent comments by the chosen sort order
  parentComments.sort((a, b) => {
    const aVal = sort.startsWith("likes") ? a.likeCount : new Date(a.createdAt).getTime();
    const bVal = sort.startsWith("likes") ? b.likeCount : new Date(b.createdAt).getTime();
    return sort.endsWith("desc") ? bVal - aVal : aVal - bVal;
  });

  // Build the tree - children always sorted by time asc
  const commentMap = new Map<string, typeof all>();
  for (const c of childComments) {
    if (!commentMap.has(c.parentId!)) commentMap.set(c.parentId!, []);
    commentMap.get(c.parentId!)!.push(c);
  }

  // Sort children by time asc
  for (const [, children] of commentMap) {
    children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  function buildTree(parents: typeof parentComments): any[] {
    return parents.map((p) => ({
      ...p,
      liked: currentUserId ? ((p.likes as any[])?.length ?? 0) > 0 : false,
      likes: undefined,
      children: buildTree(commentMap.get(p.id) || []),
    }));
  }

  return buildTree(parentComments);
}

export async function getCommentCount(entryId: string) {
  return prisma.comment.count({ where: { entryId } });
}
