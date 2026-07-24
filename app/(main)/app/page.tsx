import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getFeedEntries } from "@/server/queries/entry";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ cursor?: string; sort?: string }>;
}

export default async function HomePage({ searchParams }: Props) {
  const dict = await getDict();
  const { cursor, sort = "latest" } = await searchParams;

  // Summary stats
  const [todayMoments, todayArticles, hotArticles] = await Promise.all([
    prisma.entry.count({
      where: {
        type: "MOMENT",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.entry.count({
      where: {
        type: "ARTICLE",
        status: "PUBLISHED",
        visibility: "PUBLIC",
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.entryLike.groupBy({ by: ["entryId"], _count: { id: true }, orderBy: { _count: { id: "desc" } }, take: 5 }).then(async (rows) => {
      if (rows.length === 0) return [];
      const entryIds = rows.map((r) => r.entryId);
      const entries = await prisma.entry.findMany({
        where: { id: { in: entryIds }, type: "ARTICLE", status: "PUBLISHED" },
        select: { id: true, title: true },
      });
      const titleMap = new Map(entries.map((e) => [e.id, e.title]));
      return rows.map((r) => ({ id: r.entryId, title: titleMap.get(r.entryId) || "—", count: r._count.id }));
    }),
  ]);

  const { entries, nextCursor } = await getFeedEntries({
    contentType: "all",
    cursor,
    sort,
  });

  const sortLabels: Record<string, string> = {
    latest: dict.feed?.tabLatest || "最新",
    hottest: dict.feed?.hottest || "最热",
  };

  return (
    <AppShell>
      {/* Quick actions */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/posts/new">
          <Button variant="primary" size="sm">⚡ {dict.nav?.postNew || "发瞬间"}</Button>
        </Link>
        <Link href="/articles/new">
          <Button variant="outline" size="sm">{dict.nav?.writeArticle || "写篇章"}</Button>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-ink-faint">{dict.comment?.sort || "排序"}：</span>
          {(["latest", "hottest"] as const).map((s) => (
            <Link
              key={s}
              href={`/app?sort=${s}`}
              className={`btn btn-xs ${sort === s ? "btn-primary" : "btn-ghost"}`}
            >
              {sortLabels[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Card padding="md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-ink-muted">{dict.nav?.moments || "今日瞬间"}</p>
              <p className="text-lg font-bold">{todayMoments}</p>
            </div>
            <div className="ml-auto">
              <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-ink-muted">{dict.nav?.articles || "今日篇章"}</p>
              <p className="text-lg font-bold">{todayArticles}</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <p className="text-sm text-ink-muted mb-2">
            🔥 {dict.comment?.mostLiked || "热门篇章"}
          </p>
          {hotArticles.length === 0 ? (
            <p className="text-sm text-ink-faint">—</p>
          ) : (
            <div className="space-y-1">
              {hotArticles.slice(0, 3).map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.id}`}
                  className="flex items-center justify-between text-sm hover:text-primary transition-colors"
                >
                  <span className="truncate mr-2">{a.title}</span>
                  <Badge variant="default" size="sm">♡ {a.count}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Content stream */}
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
                <ArticleRow key={entry.id} entry={entry} dict={dict} timeLabels={dict.time} />
              ) : (
                <MomentRow key={entry.id} entry={entry} typeLabels={dict.typeLabels} completenessLabels={dict.completeness} correctionLabel={dict.correction.label} adoptedLabel={dict.post.accepted} timeLabels={dict.time} />
              )
            )}
          </div>
          {nextCursor && (
            <div className="mt-8 text-center">
              <Link href={`/app?sort=${sort}&cursor=${nextCursor}`}>
                <Button variant="outline" size="md">{dict.feed.loadMore}</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}

function MomentRow({ entry, typeLabels, completenessLabels, correctionLabel, adoptedLabel, timeLabels }: {
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
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ArticleRow({ entry, dict, timeLabels }: {
  entry: Awaited<ReturnType<typeof getFeedEntries>>["entries"][number];
  dict: any;
  timeLabels: Record<string, string>;
}) {
  const timeAgo = formatTimeAgo(entry.createdAt, timeLabels);
  const tags = entry.tags as string[] | null;

  return (
    <Link href={`/articles/${entry.id}`}>
      <Card hover>
        <div className="flex gap-4">
          {entry.coverImage && (
            <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-24">
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
              {tags && tags.length > 0 && tags.slice(0, 3).map((t: string) => (
                <Badge key={t} variant="default" size="sm">{t}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

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
