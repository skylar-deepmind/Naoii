import { prisma } from "@/lib/prisma";
import type { CommentSort } from "./comment";

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

export async function getTopicCommentsSorted(
  topicId: string,
  sort: CommentSort,
  currentUserId?: string
) {
  const orderField = sort.startsWith("likes") ? "likeCount" : "createdAt";
  const orderDir = sort.endsWith("desc") ? "desc" : "asc";

  const all = await prisma.comment.findMany({
    where: { topicId },
    select: {
      ...commentSelect,
      likes: currentUserId
        ? { where: { userId: currentUserId }, select: { id: true } }
        : false,
    },
    orderBy: { [orderField]: orderDir },
  });

  const parentComments = all.filter((c) => !c.parentId);
  const childComments = all.filter((c) => c.parentId);

  parentComments.sort((a, b) => {
    const aVal = sort.startsWith("likes") ? a.likeCount : new Date(a.createdAt).getTime();
    const bVal = sort.startsWith("likes") ? b.likeCount : new Date(b.createdAt).getTime();
    return sort.endsWith("desc") ? bVal - aVal : aVal - bVal;
  });

  const commentMap = new Map<string, typeof all>();
  for (const c of childComments) {
    if (!commentMap.has(c.parentId!)) commentMap.set(c.parentId!, []);
    commentMap.get(c.parentId!)!.push(c);
  }

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

export async function getTopicCommentCount(topicId: string) {
  return prisma.comment.count({ where: { topicId } });
}
