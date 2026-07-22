import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ReviewCard } from "@/components/ReviewCard";
import { RemoveFromLibraryButton } from "@/components/RemoveFromLibraryButton";
import { EditTagsButton } from "@/components/EditTagsButton";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getLibraryItems } from "@/server/queries/library";
import { getLibraryStats, getReviewRecommendations } from "@/server/queries/review";

interface Props {
  searchParams: Promise<{ filter?: string; tag?: string }>;
}

export default async function LibraryPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const dict = await getDict();
  const items = user ? await getLibraryItems(user.id) : [];
  const stats = user ? await getLibraryStats(user.id) : null;
  const reviews = user ? await getReviewRecommendations(user.id) : [];
  const { filter, tag } = await searchParams;

  // Apply filters
  let filtered = items;
  if (filter === "mastered") filtered = filtered.filter((i) => i.reviewStatus === "mastered");
  if (filter === "pending") filtered = filtered.filter((i) => !i.reviewStatus);
  if (filter === "recent") filtered = filtered.slice(0, 10);
  if (tag) filtered = filtered.filter((i) => ((i.tags as string[]) || []).includes(tag));

  // Collect all unique tags
  const allTags: string[] = [...new Set(items.flatMap((i) => ((i.tags as unknown as string[]) || [])))] as string[];

  return (
    <AppShell>
      <PageHeader title={dict.library.title} description={dict.library.desc} />

      {/* ── Stats Dashboard ──────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold text-primary">{stats.total}</p><p className="text-xs text-base-content/50 mt-1">{dict.library.total}</p></div></Card>
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold text-secondary">{stats.weekNew}</p><p className="text-xs text-base-content/50 mt-1">{dict.library.weekNew}</p></div></Card>
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold text-success">{stats.reviewed}</p><p className="text-xs text-base-content/50 mt-1">{dict.library.reviewed}</p></div></Card>
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold text-warning">{stats.pending}</p><p className="text-xs text-base-content/50 mt-1">{dict.library.pendingReview}</p></div></Card>
        </div>
      )}

      {/* ── Today's Review ───────────────────────── */}
      {reviews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3">📚 {dict.library.todayReview}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <ReviewCard key={r.id} {...r} typeLabels={dict.typeLabels} toneLabels={dict.toneLabels} dict={dict} />
            ))}
          </div>
        </section>
      )}

      {/* ── Filters ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-base-content/40">{dict.library.filter}:</span>
        <Link href="/library" className={`btn btn-xs ${!filter ? "btn-primary" : "btn-ghost"}`}>{dict.library.all}</Link>
        <Link href="/library?filter=mastered" className={`btn btn-xs ${filter === "mastered" ? "btn-primary" : "btn-ghost"}`}>{dict.library.mastered}</Link>
        <Link href="/library?filter=pending" className={`btn btn-xs ${filter === "pending" ? "btn-primary" : "btn-ghost"}`}>{dict.library.pending}</Link>
        <Link href="/library?filter=recent" className={`btn btn-xs ${filter === "recent" ? "btn-primary" : "btn-ghost"}`}>{dict.library.recent}</Link>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map((t) => (
              <Link key={t} href={`/library?tag=${t}`} className={`badge badge-xs ${tag === t ? "badge-primary" : "badge-ghost"}`}>{t}</Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Collection List ───────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>}
          title={dict.library.empty}
          description={dict.library.emptyDesc}
          action={{ label: dict.library.emptyAction, href: "/feed" }}
        />
      ) : (
        <div className="space-y-4 pb-8">
          {filtered.map((item) => (
            <Card key={item.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div><p className="text-xs text-base-content/40 mb-1">{dict.library.original}</p><p className="text-sm bg-error/5 border border-error/10 rounded-box p-3 leading-relaxed whitespace-pre-wrap">{item.originalTextSnapshot}</p></div>
                <div><p className="text-xs text-base-content/40 mb-1">{dict.library.corrected}</p><p className="text-sm bg-success/5 border border-success/20 rounded-box p-3 leading-relaxed whitespace-pre-wrap">{item.correctedTextSnapshot || dict.common.placeholder}</p></div>
              </div>
              {item.explanationSnapshot && (
                <div className="mb-3"><p className="text-xs text-base-content/40 mb-1">{dict.library.reason}</p><p className="text-sm text-base-content/70 bg-base-200 rounded-box p-3 leading-relaxed">{item.explanationSnapshot}</p></div>
              )}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.reviewStatus && (
                  <Badge variant={item.reviewStatus === "mastered" ? "success" : item.reviewStatus === "review" ? "warning" : "default"} size="sm">
                    {item.reviewStatus === "mastered" ? dict.review.masteredLabel : item.reviewStatus === "review" ? dict.review.reviewingLabel : dict.review.skippedLabel}
                  </Badge>
                )}
                {((item.tags as string[]) || []).map((t: string) => (
                  <Badge key={t} variant="primary" size="sm">{t}</Badge>
                ))}
                <span className="text-xs text-base-content/30 ml-auto">{dict.library.savedAt} {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-base-200 flex-wrap">
                {item.post && (
                  <>
                    <Link href={`/posts/${item.post.id}`} className="text-xs text-primary hover:underline">{dict.library.viewPost}</Link>
                    <Link href={`/posts/new?ref=${item.id}`} className="text-xs text-secondary hover:underline">📝 {dict.library.createNewFrom}</Link>
                  </>
                )}
                <EditTagsButton itemId={item.id} currentTags={(item.tags as string[]) || []} dict={dict.library as Record<string, string>} />
                <RemoveFromLibraryButton itemId={item.id} dict={dict} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
