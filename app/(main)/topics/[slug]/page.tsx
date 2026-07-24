import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getTopicBySlug, getTopicEntries, getTopicParticipantCount, type TopicStatus } from "@/server/queries/topic";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cursor?: string }>;
}

const statusBadgeMap: Record<TopicStatus, { variant: "success" | "warning" | "error" | "default"; label: string }> = {
  ACTIVE: { variant: "success", label: "进行中" },
  UPCOMING: { variant: "warning", label: "未开始" },
  ENDED: { variant: "default", label: "已结束" },
  CLOSED: { variant: "error", label: "已关闭" },
};

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

export default async function TopicDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { cursor } = await searchParams;
  const user = await getCurrentUser();
  const dict = await getDict();

  const topic = await getTopicBySlug(slug);
  if (!topic) notFound();

  const [participantCount, { entries, nextCursor }] = await Promise.all([
    getTopicParticipantCount(topic.id),
    getTopicEntries({ topicId: topic.id, cursor }),
  ]);

  const st = dict.topics?.status || {};
  const statusInfo = statusBadgeMap[topic.status];
  const statusLabel = st[topic.status.toLowerCase() as keyof typeof st] || statusInfo.label;

  const canPost = topic.status === "ACTIVE";

  return (
    <AppShell>
      {/* Topic Header */}
      <div className="mb-6">
        {topic.coverImage && (
          <div className="relative h-48 -mx-4 sm:mx-0 -mt-4 mb-4 overflow-hidden sm:rounded-box">
            <img src={topic.coverImage} alt={topic.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{topic.name}</h1>
              <Badge variant={statusInfo.variant} size="sm">{statusLabel}</Badge>
              {topic.isPermanent && <Badge variant="default" size="sm">{dict.topics?.permanent || "常驻"}</Badge>}
            </div>
            <p className="text-base text-ink-muted mb-3">{topic.description}</p>
            {!topic.isPermanent && topic.eventDescription && (
              <div className="bg-base-200 rounded-box p-3 mb-3 text-sm">
                <p className="whitespace-pre-wrap">{topic.eventDescription}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-ink-muted">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {participantCount} {dict.topics?.participants || "参与人数"}
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {topic.entryCount} {dict.topics?.relatedEntries || "篇内容"}
              </span>
              {topic.startTime && (
                <span>
                  {new Date(topic.startTime).toLocaleDateString("zh-CN")} - {topic.endTime ? new Date(topic.endTime).toLocaleDateString("zh-CN") : "—"}
                </span>
              )}
            </div>
          </div>
          {canPost && user && (
            <div className="flex gap-2 shrink-0">
              <Link href={`/posts/new?topic=${slug}`}>
                <Button variant="primary" size="sm">{dict.topics?.quickPost || "发瞬间"}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Back link */}
      <div className="mb-4">
        <Link href="/topics" className="text-sm text-ink-muted hover:underline">
          &larr; {dict.topics?.title || "话题"}
        </Link>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          title={dict.feed?.empty || "暂无内容"}
        />
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => (
              <Link key={entry.id} href={entry.type === "ARTICLE" ? `/articles/${entry.id}` : `/posts/${entry.id}`}>
                <Card hover>
                  <div className="flex items-start gap-3">
                    <UserAvatar username={entry.author.displayName || entry.author.username} size="sm" className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      {entry.title && <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{entry.title}</h3>}
                      <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{entry.content}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs text-ink-muted">{entry.author.displayName || entry.author.username}</span>
                        <span className="text-xs text-ink-faint">·</span>
                        <span className="text-xs text-ink-muted">{formatTimeAgo(entry.createdAt, dict.time)}</span>
                        {entry.tags && (entry.tags as string[]).length > 0 && (entry.tags as string[]).slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                        ))}
                        {entry.correctionCount > 0 && <Badge variant="primary" size="sm">{entry.correctionCount} {dict.correction?.label || "修改"}</Badge>}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          {nextCursor && (
            <div className="mt-8 text-center">
              <Link href={`/topics/${slug}?cursor=${nextCursor}`}>
                <Button variant="outline" size="md">{dict.feed?.loadMore || "加载更多"}</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
