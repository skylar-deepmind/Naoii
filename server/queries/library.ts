import { prisma } from "@/lib/prisma";

export async function getLibraryItems(userId: string) {
  return prisma.expressionCollectionItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          content: true,
        },
      },
    },
  });
}
