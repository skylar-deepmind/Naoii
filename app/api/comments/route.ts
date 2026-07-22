import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { entryId, correctionId, userId } = await request.json();
    if (!entryId) {
      return NextResponse.json({ error: "entryId required" }, { status: 400 });
    }

    const where: any = correctionId ? { correctionId } : { entryId };
    if (!correctionId) where.entryId = entryId;

    const all = await prisma.comment.findMany({
      where,
      select: {
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
        likes: userId
          ? { where: { userId }, select: { id: true } }
          : false,
      },
      orderBy: { createdAt: "asc" },
    });

    const parentComments = all.filter((c: any) => !c.parentId);
    const childComments = all.filter((c: any) => c.parentId);

    const commentMap = new Map<string, typeof all>();
    for (const c of childComments) {
      if (!commentMap.has(c.parentId!)) commentMap.set(c.parentId!, []);
      commentMap.get(c.parentId!)!.push(c);
    }

    for (const [, children] of commentMap) {
      children.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    function buildTree(parents: typeof parentComments): any[] {
      return parents.map((p) => ({
        ...p,
        liked: userId ? ((p.likes as any[])?.length ?? 0) > 0 : false,
        likes: undefined,
        children: buildTree(commentMap.get(p.id) || []),
      }));
    }

    return NextResponse.json(buildTree(parentComments));
  } catch (e) {
    console.error("Comments API error:", e);
    return NextResponse.json([], { status: 500 });
  }
}
