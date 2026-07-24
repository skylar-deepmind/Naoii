import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProfileFilters } from "@/components/ProfileFilters";
import { getUserByUsername, getUserEntryStats, getUserAvailableYears, getUserEntries, type UserEntryType } from "@/server/queries/user";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

interface Props { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | undefined>>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const sp = await searchParams;
  const type = (sp.type as string) || "all";
  const year = sp.year ? parseInt(sp.year) : undefined;
  const month = sp.month ? parseInt(sp.month) : undefined;
  const cursor = sp.cursor || undefined;

  const [user, currentUser, dict] = await Promise.all([
    getUserByUsername(username),
    getCurrentUser(),
    getDict(),
  ]);

  if (!user) notFound();

  const isOwner = currentUser?.id === user.id;
  const profile = user.profile!;

  const [stats, availableYears, { entries, nextCursor }] = await Promise.all([
    getUserEntryStats(user.id, isOwner),
    getUserAvailableYears(user.id, isOwner),
    getUserEntries({ userId: user.id, viewerId: currentUser?.id, type: type as UserEntryType, year, month, cursor }),
  ]);

  const displayName = profile.displayName || user.username;
  const filterLabels = {
    all: dict.profile.allContent || "全部",
    moment: dict.profile.moments || "瞬间",
    article: dict.profile.articles || "篇章",
    draft: dict.profile.drafts || "草稿箱",
    allYears: dict.profile.allYears || "全部年份",
    allMonths: dict.profile.allMonths || "全部月份",
  };

  return (
    <AppShell>
      <div className="py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
          <UserAvatar username={user.username} src={profile.avatarUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{displayName}</h1>
              {isOwner && (
                <Link href="/settings/profile">
                  <Badge variant="default" size="sm">{dict.profile.editProfile || "编辑资料"}</Badge>
                </Link>
              )}
            </div>
            <p className="text-ink-muted text-sm">@{user.username}</p>
            {profile.bio && <p className="mt-3 text-sm leading-relaxed max-w-lg">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard label={dict.profile.moments || "瞬间"} count={stats.momentCount} active={type === "moment"} href={`/profile/${username}?type=moment`} />
          <StatCard label={dict.profile.articles || "篇章"} count={stats.articleCount} active={type === "article"} href={`/profile/${username}?type=article`} />
          {isOwner && (
            <StatCard label={dict.profile.drafts || "草稿箱"} count={stats.draftCount} active={type === "draft"} href={`/profile/${username}?type=draft`} variant="warning" />
          )}
        </div>

        <Card className="mb-8">
          <h2 className="font-semibold text-base mb-4">{dict.profile.learningInfo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-ink-muted text-xs mb-0.5">{dict.profile.nativeLang}</p><p className="flex items-center gap-1.5">{profile.nativeLanguage ? <Badge variant="default" size="sm">{profile.nativeLanguage.nativeName}</Badge> : <span className="text-ink-faint">{dict.profile.notSet}</span>}</p></div>
            <div><p className="text-ink-muted text-xs mb-0.5">{dict.profile.learningLang}</p><p className="flex items-center gap-1.5">{profile.learningLanguage ? <Badge variant="primary" size="sm">{profile.learningLanguage.nativeName}</Badge> : <span className="text-ink-faint">{dict.profile.notSet}</span>}</p></div>
            <div><p className="text-ink-muted text-xs mb-0.5">{dict.auth.level}</p><p className="flex items-center gap-1.5">{profile.level ? <Badge variant="success" size="sm">{dict.level[profile.level as keyof typeof dict.level] || profile.level}</Badge> : <span className="text-ink-faint">{dict.profile.notSet}</span>}</p></div>
          </div>
        </Card>

        {stats.momentCount + stats.articleCount + (isOwner ? stats.draftCount : 0) > 0 && (
          <div className="mb-6">
            <ProfileFilters
              username={username}
              currentType={type}
              currentYear={year}
              currentMonth={month}
              years={availableYears}
              months={dict.profile.months || []}
              isOwner={isOwner}
              labels={filterLabels}
            />
          </div>
        )}

        {entries.length === 0 ? (
          <EmptyState
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>}
            title={isOwner ? (dict.profile.noEntriesSelf || "你还没有发布任何记录") : (dict.profile.noEntries || "暂无记录")}
            description={isOwner ? (dict.profile.noEntriesSelfDesc || "发布你的第一个瞬间或篇章吧") : (dict.profile.noEntriesDesc || "这里还没有内容")}
            action={isOwner ? { label: dict.nav?.postNew || "发布瞬间", href: "/posts/new" } : undefined}
          />
        ) : (
          <>
            <div className="space-y-3">
              {entries.map((entry) =>
                entry.type === "ARTICLE" ? (
                  <ArticleRow key={entry.id} entry={entry} dict={dict} timeLabels={dict.time} />
                ) : (
                  <MomentRow key={entry.id} entry={entry} typeLabels={dict.typeLabels} completenessLabels={dict.completeness} correctionLabel={dict.correction?.label || "修改建议"} adoptedLabel={dict.post?.accepted || "已采纳"} timeLabels={dict.time} />
                )
              )}
            </div>
            {nextCursor && (
              <div className="mt-8 text-center">
                <Link href={buildProfileUrl(username, type, year, month, nextCursor)}>
                  <Button variant="outline" size="md">{dict.profile.loadMore || "加载更多"}</Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, count, active, href, variant = "default" }: { label: string; count: number; active: boolean; href: string; variant?: "default" | "warning" }) {
  return (
    <Link href={href}>
      <Card padding="sm" hover>
        <div className="text-center">
          <p className={`text-2xl font-bold ${variant === "warning" ? "text-warning" : active ? "text-primary" : ""}`}>{count}</p>
          <p className={`text-xs mt-1 ${active ? "text-base-content font-medium" : "text-ink-muted"}`}>{label}</p>
          {active && <div className="w-8 h-0.5 bg-primary mx-auto mt-1.5 rounded-full" />}
        </div>
      </Card>
    </Link>
  );
}

function buildProfileUrl(username: string, type?: string, year?: number, month?: number, cursor?: string): string {
  const params = new URLSearchParams();
  if (type && type !== "all") params.set("type", type);
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  if (cursor) params.set("cursor", cursor);
  const qs = params.toString();
  return `/profile/${username}${qs ? `?${qs}` : ""}`;
}

function MomentRow({ entry, typeLabels, completenessLabels, correctionLabel, adoptedLabel, timeLabels }: {
  entry: NonNullable<Awaited<ReturnType<typeof getUserEntries>>["entries"]>[number];
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
          <div className="flex-1 min-w-0">
            {entry.title && <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{entry.title}</h3>}
            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{entry.content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-ink-muted">{timeAgo}</span>
              {entry.targetLanguage && <><span className="text-xs text-ink-faint">·</span><Badge variant="default" size="sm">{entry.targetLanguage.nativeName}</Badge></>}
              {entry.completeness && completenessLabels[entry.completeness] && (
                <Badge variant={entry.completeness === "PARTIAL" ? "warning" : entry.completeness === "IDEA_ONLY" ? "error" : "default"} size="sm">{completenessLabels[entry.completeness]}</Badge>
              )}
              {entry.expressionType && typeLabels[entry.expressionType] && <Badge variant="default" size="sm">{typeLabels[entry.expressionType]}</Badge>}
              {entry.correctionCount > 0 && <Badge variant="primary" size="sm">{entry.correctionCount} {correctionLabel}</Badge>}
              {entry.hasAdoptedCorrection && <Badge variant="success" size="sm">{adoptedLabel}</Badge>}
              {entry.visibility === "PRIVATE" && <Badge variant="warning" size="sm">私密</Badge>}
              {entry.status === "DRAFT" && <Badge variant="warning" size="sm">草稿</Badge>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ArticleRow({ entry, dict, timeLabels }: {
  entry: NonNullable<Awaited<ReturnType<typeof getUserEntries>>["entries"]>[number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{entry.title || dict.common?.placeholder || "无标题"}</h3>
            <p className="text-sm text-foreground/70 leading-relaxed line-clamp-2">{entry.content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-ink-muted">{timeAgo}</span>
              {tags && tags.length > 0 && tags.slice(0, 3).map((t: string) => (
                <Badge key={t} variant="default" size="sm">{t}</Badge>
              ))}
              {entry.visibility === "PRIVATE" && <Badge variant="warning" size="sm">私密</Badge>}
              {entry.status === "DRAFT" && <Badge variant="warning" size="sm">草稿</Badge>}
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
