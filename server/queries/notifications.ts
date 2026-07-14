import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function getNotifications({
  userId,
  cursor,
}: {
  userId: string;
  cursor?: string;
}) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = notifications.length > PAGE_SIZE;
  if (hasMore) notifications.pop();

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      isRead: n.isRead,
      relatedPostId: n.relatedPostId,
      relatedCorrectionId: n.relatedCorrectionId,
      createdAt: n.createdAt.toISOString(),
    })),
    nextCursor: hasMore ? notifications[notifications.length - 1]?.id : null,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}
