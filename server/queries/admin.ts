import { prisma } from "@/lib/prisma";

// Reports
export async function getPendingReports() {
  return prisma.report.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, username: true } },
      post: { select: { id: true, title: true, status: true } },
      correction: { select: { id: true, correctedText: true, status: true } },
    },
  });
}

// Users
export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: { select: { reputationScore: true } },
      _count: { select: { posts: true, corrections: true } },
    },
    take: 50,
  });
}

// All posts (admin view)
export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true } },
      _count: { select: { corrections: { where: { status: { notIn: ["DELETED"] } } } } },
    },
    take: 50,
  });
}

// All corrections (admin view)
export async function getAllCorrections() {
  return prisma.correction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { username: true } },
      post: { select: { id: true, title: true } },
    },
    take: 50,
  });
}

// Admin action log
export async function getAdminLogs() {
  return prisma.adminActionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
