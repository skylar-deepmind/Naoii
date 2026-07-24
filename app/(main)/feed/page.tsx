import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { FeedTabs } from "@/components/FeedTabs";
import { getCurrentUser } from "@/lib/auth";
import { getFeedEntries } from "@/server/queries/entry";
import { getDict } from "@/lib/i18n";

type TabKey = "latest" | "awaiting" | "has_corrections" | "adopted";
type ContentType = "all" | "moment" | "article";

function isValidTab(tab: string): tab is TabKey {
  return ["latest", "awaiting", "has_corrections", "adopted"].includes(tab);
}

function isValidContentType(ct: string): ct is ContentType {
  return ["all", "moment", "article"].includes(ct);
}

interface Props {
  searchParams: Promise<{
    tab?: string;
    type?: string;
    cursor?: string;
    completeness?: string;
    tag?: string;
  }>;
}

export default async function FeedPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const dict = await getDict();
  const { tab = "latest", type = "all", cursor, completeness, tag } = await searchParams;
  const currentTab = isValidTab(tab) ? tab : "latest";
  const currentType = isValidContentType(type) ? type : "all";
  const { entries, nextCursor } = await getFeedEntries({
    tab: currentTab,
    contentType: currentType,
    completeness,
    tag,
    cursor,
  });

  const contentTypeLabels: Record<ContentType, string> = {
    all: dict.feed?.allContent || "全部",
    moment: dict.feed?.moments || "瞬间",
    article: dict.feed?.articles || "篇章",
  };

  const isMomentTab = currentType !== "article";

  return (
    <AppShell>
      <PageHeader
        title={dict.feed.title}
        description={dict.feed.desc}
        action={
          <div className="flex gap-2">
            <Link href="/articles/new">
              <Button variant="outline" size="sm">{dict.nav?.writeArticle || "写篇章"}</Button>
            </Link>
            <Link href="/posts/new">
              <Button variant="primary" size="sm">{dict.nav.postNew}</Button>
            </Link>
          </div>
        }
      />

      {/* Content Type Tabs */}
      <div className="tabs tabs-box mb-4">
        {(["all", "moment", "article"] as ContentType[]).map((ct) => (
          <Link
            key={ct}
            href={`/feed?type=${ct}&tab=${currentTab}${completeness ? `&completeness=${completeness}` : ""}`}
            className={`tab tab-sm ${currentType === ct ? "tab-active" : ""}`}
          >
            {contentTypeLabels[ct]}
          </Link>
        ))}
      </div>

      {isMomentTab && <FeedTabs dict={dict} />}

      {tag && (
        <div className="mb-4">
          <Badge variant="primary" size="sm">#{tag}</Badge>
          <Link href={`/feed?tab=${currentTab}&type=${currentType}`} className="text-xs text-ink-faint ml-2 hover:underline">
            ✕ {dict.feed?.clearFilter || "清除筛选"}
          </Link>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title={dict.feed.empty}
          action={{ label: dict.feed.emptyAction, href: "/posts/new" }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) =>
              entry.type === "ARTICLE" ? (
                <ArticleCard key={entry.id} entry={entry} typeLabels={dict.typeLabels} timeLabels={dict.time} dict={dict} />
              ) : (
                <MomentCard key={entry.id} entry={entry} typeLabels={dict.typeLabels} completenessLabels={dict.completeness} correctionLabel={dict.correction.label} adoptedLabel={dict.post.accepted} timeLabels={dict.time} />
              )
            )}
          </div>
          {nextCursor && (
            <div className="mt-8 text-center">
              <Link
                href={`/feed?tab=${currentTab}&type=${currentType}&cursor=${nextCursor}${completeness ? `&completeness=${completeness}` : ""}${tag ? `&tag=${tag}` : ""}`}
              >
                <Button variant="outline" size="md">{dict.feed.loadMore}</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

// ── Moment Card ──────────────────────────────────────

function MomentCard({ entry, typeLabels, completenessLabels, correctionLabel, adoptedLabel, timeLabels }: {
  entry: Awaited<ReturnType<typeof getFeedEntries>>["entries"][number];
  typeLabels: Record<string, string>;
  completenessLabels: Record<string, string>;
  correctionLabel: string;
  adoptedLabel: string;
  timeLabels: Record<string, string>;
}) {
  const timeAgo = formatTimeAgo(entry.createdAt, timeLabels);

  return (
    <Link href={`/posts/${entry.id}`}>
      <Card hover>
        <div className="flex items-start gap-3">
          <UserAvatar username={entry.author.displayName || entry.author.username} size="sm" className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {entry.title && <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{entry.title}</h3>}
            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{entry.content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-ink-muted">{entry.author.displayName || entry.author.username}</span>
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs text-ink-muted">{timeAgo}</span>
              {entry.targetLanguage && <><span className="text-xs text-ink-faint">·</span><Badge variant="default" size="sm">{entry.targetLanguage.nativeName}</Badge></>}
              {entry.completeness && completenessLabels[entry.completeness] && (
                <Badge variant={entry.completeness === "PARTIAL" ? "warning" : entry.completeness === "IDEA_ONLY" ? "error" : "default"} size="sm">{completenessLabels[entry.completeness]}</Badge>
              )}
              {entry.expressionType && typeLabels[entry.expressionType] && <Badge variant="default" size="sm">{typeLabels[entry.expressionType]}</Badge>}
              {entry.correctionCount > 0 && <Badge variant="primary" size="sm">{entry.correctionCount} {correctionLabel}</Badge>}
              {entry.hasAdoptedCorrection && <Badge variant="success" size="sm">{adoptedLabel}</Badge>}
            {entry.topic && (
              <Link href={`/topics/${entry.topic.slug}`} onClick={(e) => e.stopPropagation()}>
                <Badge variant="default" size="sm">#{entry.topic.name}</Badge>
              </Link>
            )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ── Article Card ─────────────────────────────────────

function ArticleCard({ entry, typeLabels, timeLabels, dict }: {
  entry: Awaited<ReturnType<typeof getFeedEntries>>["entries"][number];
  typeLabels: Record<string, string>;
  timeLabels: Record<string, string>;
  dict: any;
}) {
  const timeAgo = formatTimeAgo(entry.createdAt, timeLabels);
  const tags = entry.tags as string[] | null;

  return (
    <Link href={`/articles/${entry.id}`}>
      <Card hover>
        <div className="flex gap-4">
          {entry.coverImage && (
            <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-24">
              <img src={entry.coverImage} alt="" className="w-full h-full object-cover rounded-box" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{entry.title || dict.common.placeholder}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{entry.content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-ink-muted">{entry.author.displayName || entry.author.username}</span>
              <span className="text-xs text-ink-faint">·</span>
              <span className="text-xs text-ink-muted">{timeAgo}</span>
              {tags && tags.length > 0 && (
                <>
                  <span className="text-xs text-ink-faint">·</span>
                  {tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                  ))}
                </>
              )}
              {entry.topic && (
                <Link href={`/topics/${entry.topic.slug}`} onClick={(e) => e.stopPropagation()}>
                  <Badge variant="default" size="sm">#{entry.topic.name}</Badge>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

// ── Helpers ──────────────────────────────────────────

function formatTimeAgo(dateStr: string, timeLabels?: Record<string, string>): string {
  const t = timeLabels || {};
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return t.justNow || "刚刚";
  if (minutes < 60) return `${minutes}${t.minuteAgo || " 分钟前"}`;
  if (hours < 24) return `${hours}${t.hourAgo || " 小时前"}`;
  if (days < 30) return `${days}${t.dayAgo || " 天前"}`;
  return new Date(dateStr).toLocaleDateString();
}
