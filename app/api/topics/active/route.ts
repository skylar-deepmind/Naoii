import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canPostToTopic } from "@/server/queries/topic";

export async function GET() {
  const topics = await prisma.topic.findMany({
    where: { closedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, isPermanent: true, startTime: true, endTime: true, closedAt: true },
  });

  const active = topics.filter((t) => canPostToTopic(t));
  return NextResponse.json(active.map((t) => ({ id: t.id, name: t.name })));
}
