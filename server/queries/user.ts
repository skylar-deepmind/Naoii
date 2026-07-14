import { prisma } from "@/lib/prisma";

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
