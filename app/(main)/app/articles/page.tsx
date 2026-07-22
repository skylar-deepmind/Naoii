import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getFeedEntries } from "@/server/queries/entry";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ cursor?: string; tag?: string; sort?: string }>;
}

export default async function ArticlesPage({ searchParams }: Props) {
  const dict = await getDict();
  const { cursor, tag, sort = "latest" } = await searchParams;

  const { entries, nextCursor } = await getFeedEntries({
    contentType: "article",
    tag: tag || undefined,
    cursor,
    sort,
  });

  // Aggregate popular tags
  const allArticles = await prisma.entry.findMany({
    where: { type: "ARTICLE", status: "PUBLISHED", visibility: "PUBLIC" },
    select: { tags: true },
    take: 200,
  });
  const tagCountMap = new Map<string, number>();
  for (const a of allArticles) {
    const tags = (a.tags as string[]) || [];
    for (const t of tags) {
      tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
    }
  }
  const popularTags = [...tagCountMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([t]) => t);

  const sortLabels: Record<string, string> = {
    latest: dict.feed?.tabLatest || "最新",
    hottest: dict.feed?.hottest || "最热",
  };

  return (
    <AppShell>
      <PageHeader
        title={dict.nav?.articles || "篇章"}
        description={dict.feed.desc}
        action={
          <Link href="/articles/new">
            <Button variant="primary" size="sm">{dict.nav?.writeArticle || "写篇章"}</Button>
          </Link>
        }
      />

      {/* Tag quick filter */}
      {popularTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 mb-4">
          <Link
            href={`/app/articles?sort=${sort}`}
            className={`btn btn-xs ${!tag ? "btn-primary" : "btn-ghost"}`}
          >
            {dict.feed?.allContent || "全部"}
          </Link>
          {popularTags.map((t) => (
            <Link
              key={t}
              href={`/app/articles?tag=${t}&sort=${sort}`}
              className={`btn btn-xs ${tag === t ? "btn-primary" : "btn-ghost"}`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-base-content/40">{dict.comment?.sort || "排序"}：</span>
        {(["latest", "hottest"] as const).map((s) => (
          <Link
            key={s}
            href={`/app/articles?sort=${s}${tag ? `&tag=${tag}` : ""}`}
            className={`btn btn-xs ${sort === s ? "btn-primary" : "btn-ghost"}`}
          >
            {sortLabels[s]}
          </Link>
        ))}
        {tag && (
          <Link
            href={`/app/articles?sort=${sort}`}
            className="text-xs text-base-content/40 ml-2 hover:underline"
          >
            ✕ {dict.feed?.clearFilter || "清除筛选"}
          </Link>
        )}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title={dict.feed.empty}
          action={{ label: dict.nav?.writeArticle || "写篇章", href: "/articles/new" }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => (
              <ArticleCard key={entry.id} entry={entry} dict={dict} timeLabels={dict.time} />
            ))}
          </div>
          {nextCursor && (
            <div className="mt-8 text-center">
              <Link
                href={`/app/articles?sort=${sort}${tag ? `&tag=${tag}` : ""}&cursor=${nextCursor}`}
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

function ArticleCard({ entry, dict, timeLabels }: {
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
            <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">{entry.content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <UserAvatar username={entry.author.displayName || entry.author.username} size="sm" />
              <span className="text-xs text-base-content/50">{entry.author.displayName || entry.author.username}</span>
              <span className="text-xs text-base-content/30">·</span>
              <span className="text-xs text-base-content/50">{timeAgo}</span>
              {tags && tags.length > 0 && (
                <>
                  <span className="text-xs text-base-content/30">·</span>
                  {tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                  ))}
                </>
              )}
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
