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
import { getEntryById, getEntryCorrections, getEntryCorrectionCount } from "@/server/queries/entry";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getEntryById(id);
  if (!entry) return { title: "瞬间不存在" };
  return { title: entry.title || "查看瞬间" };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await getEntryById(id);
  const currentUser = await getCurrentUser();
  const dict = await getDict();
  const locale = await getLocale();

  if (!entry) notFound();

  const isAuthor = currentUser?.id === entry.author.id;
  if (entry.visibility === "PRIVATE" && !isAuthor) notFound();

  // Fetch corrections via shared ID (Entry.id == Post.id for mirrored records)
  const corrections = await getEntryCorrections(id);
  const correctionCount = await getEntryCorrectionCount(id);

  let savedCorrectionIds = new Set<string>();
  if (currentUser) {
    const saved = await prisma.expressionCollectionItem.findMany({
      where: { userId: currentUser.id, postId: id },
      select: { correctionId: true },
    });
    savedCorrectionIds = new Set(saved.map((s: { correctionId: string | null }) => s.correctionId).filter(Boolean) as string[]);
  }

  const timeStr = new Date(entry.createdAt).toLocaleString(locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
  type CorrectionItem = typeof corrections[number];
  const visibleCorrections = corrections.filter((c: CorrectionItem) => isAuthor ? true : c.status === "PUBLISHED");
  const postHasAccepted = corrections.some((c: CorrectionItem) => c.isAccepted);
  const showCorrectionForm = currentUser && !isAuthor && entry.status === "PUBLISHED";

  return (
    <AppShell>
      <div className="py-8 max-w-3xl">
        <Link href="/feed" className="text-sm text-base-content/50 hover:text-base-content mb-6 inline-block">← {dict.post.backToFeed}</Link>

        <div className="flex items-start gap-4 mb-6">
          <Link href={`/profile/${entry.author.username}`}><UserAvatar username={entry.author.profile?.displayName || entry.author.username} src={entry.author.profile?.avatarUrl} size="md" /></Link>
          <div className="min-w-0">
            <Link href={`/profile/${entry.author.username}`} className="font-semibold hover:underline">{entry.author.profile?.displayName || entry.author.username}</Link>
            <p className="text-sm text-base-content/50">@{entry.author.username}</p>
          </div>
        </div>

        {entry.title && <h1 className="text-2xl font-bold mb-4">{entry.title}</h1>}

        <Card><p className="text-lg leading-relaxed whitespace-pre-wrap">{entry.content}</p></Card>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {entry.targetLanguage && <Badge variant="primary" size="sm">{entry.targetLanguage.nativeName}</Badge>}
          {entry.completeness && dict.completeness[entry.completeness as keyof typeof dict.completeness] && <Badge variant={entry.completeness === "PARTIAL" ? "warning" : entry.completeness === "IDEA_ONLY" ? "error" : "default"} size="sm">{dict.completeness[entry.completeness as keyof typeof dict.completeness]}</Badge>}
          {entry.expressionType && dict.typeLabels[entry.expressionType] && <Badge variant="default" size="sm">{dict.typeLabels[entry.expressionType]}</Badge>}
          {entry.tone && dict.toneLabels[entry.tone] && <Badge variant="default" size="sm">{dict.toneLabels[entry.tone]}</Badge>}
          <Badge variant="default" size="sm">{dict.visibilityLabels[entry.visibility] || entry.visibility}</Badge>
          {postHasAccepted && <Badge variant="success" size="sm">{dict.post.accepted}</Badge>}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <p className="text-sm text-base-content/40">{timeStr}</p>
          {currentUser && !isAuthor && <ReportButton postId={id} dict={dict} />}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold mb-4">{dict.post.corrections} ({correctionCount})</h2>
          {visibleCorrections.length === 0 ? (
            <p className="text-sm text-base-content/50 py-8 text-center">{showCorrectionForm ? dict.post.noCorrections : dict.post.noCorrectionsYet}</p>
          ) : (
            <div className="space-y-4">
              {visibleCorrections.map((correction: CorrectionItem) => (
                <div key={correction.id}>
                  <CorrectionCard id={correction.id} correctedText={correction.correctedText} explanation={correction.explanation} toneNote={correction.toneNote} isAccepted={correction.isAccepted} createdAt={correction.createdAt} author={{ username: correction.author.username, displayName: correction.author.profile?.displayName ?? null, avatarUrl: correction.author.profile?.avatarUrl ?? null }} originalContent={entry.content} dict={dict} locale={locale} />
                  <div className="flex items-center gap-3 mt-2 ml-2">
                    {isAuthor && <AcceptButton correctionId={correction.id} postId={id} isAlreadyAccepted={correction.isAccepted} postHasAccepted={postHasAccepted} dict={dict} />}
                    {currentUser && currentUser.id !== correction.author.id && <ReportButton postId={id} correctionId={correction.id} dict={dict} />}
                    <SaveToLibraryButton correctionId={correction.id} postId={id} isAccepted={correction.isAccepted} isSaved={savedCorrectionIds.has(correction.id)} dict={dict} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {showCorrectionForm && (
            <div className="mt-8 border-t border-base-200 pt-6"><CorrectionForm postId={id} originalContent={entry.content} dict={dict} /></div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
