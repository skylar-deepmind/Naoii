import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { CorrectionForm } from "@/components/CorrectionForm";
import { CorrectionCard } from "@/components/CorrectionCard";
import { AcceptButton } from "@/components/AcceptButton";
import { SaveToLibraryButton } from "@/components/SaveToLibraryButton";
import { ReportButton } from "@/components/ReportButton";
import { getPostById } from "@/server/queries/post";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "Post not found" };
  return { title: post.title || "View Expression" };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(id);
  const currentUser = await getCurrentUser();
  const dict = await getDict();

  if (!post) notFound();

  const isAuthor = currentUser?.id === post.author.id;
  if (post.visibility === "PRIVATE" && !isAuthor) notFound();

  let savedCorrectionIds = new Set<string>();
  if (currentUser) {
    const saved = await prisma.expressionCollectionItem.findMany({
      where: { userId: currentUser.id, postId: post.id },
      select: { correctionId: true },
    });
    savedCorrectionIds = new Set(saved.map((s: { correctionId: string | null }) => s.correctionId).filter(Boolean) as string[]);
  }

  const timeStr = new Date(post.createdAt).toLocaleString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  type CorrectionItem = typeof post.corrections[number];
  const visibleCorrections = post.corrections.filter((c: CorrectionItem) => isAuthor ? true : c.status === "PUBLISHED");
  const postHasAccepted = post.corrections.some((c: CorrectionItem) => c.isAccepted);
  const showCorrectionForm = currentUser && !isAuthor && post.status === "PUBLISHED";

  return (
    <AppShell>
      <div className="py-8 max-w-3xl">
        <Link href="/feed" className="text-sm text-base-content/50 hover:text-base-content mb-6 inline-block">← {dict.post.backToFeed}</Link>

        <div className="flex items-start gap-4 mb-6">
          <Link href={`/profile/${post.author.username}`}><UserAvatar username={post.author.profile?.displayName || post.author.username} size="md" /></Link>
          <div className="min-w-0">
            <Link href={`/profile/${post.author.username}`} className="font-semibold hover:underline">{post.author.profile?.displayName || post.author.username}</Link>
            <p className="text-sm text-base-content/50">@{post.author.username}</p>
          </div>
        </div>

        {post.title && <h1 className="text-2xl font-bold mb-4">{post.title}</h1>}

        <Card><p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p></Card>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {post.targetLanguage && <Badge variant="primary" size="sm">{post.targetLanguage.nativeName}</Badge>}
          {post.completeness && dict.completeness[post.completeness as keyof typeof dict.completeness] && <Badge variant={post.completeness === "PARTIAL" ? "warning" : post.completeness === "IDEA_ONLY" ? "error" : "default"} size="sm">{dict.completeness[post.completeness as keyof typeof dict.completeness]}</Badge>}
          {post.expressionType && dict.typeLabels[post.expressionType] && <Badge variant="default" size="sm">{dict.typeLabels[post.expressionType]}</Badge>}
          {post.tone && dict.toneLabels[post.tone] && <Badge variant="default" size="sm">{dict.toneLabels[post.tone]}</Badge>}
          <Badge variant="default" size="sm">{dict.visibilityLabels[post.visibility] || post.visibility}</Badge>
          {post.status === "ACCEPTED" && <Badge variant="success" size="sm">{dict.post.accepted}</Badge>}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <p className="text-sm text-base-content/40">{timeStr}</p>
          {currentUser && !isAuthor && <ReportButton postId={post.id} dict={dict} />}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">{dict.post.corrections} ({visibleCorrections.length})</h2>
          {visibleCorrections.length === 0 ? (
            <p className="text-sm text-base-content/50 py-8 text-center">{showCorrectionForm ? dict.post.noCorrections : dict.post.noCorrectionsYet}</p>
          ) : (
            <div className="space-y-4">
              {visibleCorrections.map((correction: CorrectionItem) => (
                <div key={correction.id}>
                  <CorrectionCard id={correction.id} correctedText={correction.correctedText} explanation={correction.explanation} toneNote={correction.toneNote} isAccepted={correction.isAccepted} createdAt={correction.createdAt} author={{ username: correction.author.username, displayName: correction.author.profile?.displayName ?? null, avatarUrl: correction.author.profile?.avatarUrl ?? null }} originalContent={post.content} dict={dict} />
                  <div className="flex items-center gap-3 mt-2 ml-2">
                    {isAuthor && <AcceptButton correctionId={correction.id} postId={post.id} isAlreadyAccepted={correction.isAccepted} postHasAccepted={postHasAccepted} dict={dict} />}
                    {currentUser && currentUser.id !== correction.author.id && <ReportButton postId={post.id} correctionId={correction.id} dict={dict} />}
                    <SaveToLibraryButton correctionId={correction.id} postId={post.id} isAccepted={correction.isAccepted} isSaved={savedCorrectionIds.has(correction.id)} dict={dict} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {showCorrectionForm && (
            <div className="mt-8 border-t border-base-200 pt-6"><CorrectionForm postId={post.id} originalContent={post.content} dict={dict} /></div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
