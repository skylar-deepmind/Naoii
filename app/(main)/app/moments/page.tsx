import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { getCurrentUser } from "@/lib/auth";
import { getFeedEntries } from "@/server/queries/entry";
import { getDict } from "@/lib/i18n";

type TabKey = "latest" | "awaiting" | "has_corrections" | "adopted";

function isValidTab(tab: string): tab is TabKey {
  return ["latest", "awaiting", "has_corrections", "adopted"].includes(tab);
}

const TAB_LABELS: Record<TabKey, string> = {
  latest: "tabLatest",
  awaiting: "tabAwaiting",
  has_corrections: "tabHasCorrections",
  adopted: "tabAdopted",
};

interface Props {
  searchParams: Promise<{ tab?: string; cursor?: string; completeness?: string; sort?: string }>;
}

const COMPLETENESS_OPTIONS = ["", "COMPLETE", "PARTIAL", "IDEA_ONLY"] as const;

export default async function MomentsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const dict = await getDict();
  const { tab = "latest", cursor, completeness, sort = "latest" } = await searchParams;
  const currentTab = isValidTab(tab) ? tab : "latest";

  const { entries, nextCursor } = await getFeedEntries({
    tab: currentTab,
    contentType: "moment",
    completeness: completeness || undefined,
    cursor,
    sort,
  });

  const completenessLabels: Record<string, string> = {
    "": dict.completeness.all,
    COMPLETE: dict.completeness.complete,
    PARTIAL: dict.completeness.partial,
    IDEA_ONLY: dict.completeness.ideaOnly,
  };

  const sortLabels: Record<string, string> = {
    latest: dict.feed?.tabLatest || "最新",
    hottest: dict.feed?.hottest || "最热",
  };

  return (
    <AppShell>
      <PageHeader
        title={dict.nav?.moments || "瞬间"}
        description={dict.feed.desc}
        action={
          <Link href="/posts/new">
            <Button variant="primary" size="sm">{dict.nav?.postNew || "发瞬间"}</Button>
          </Link>
        }
      />

      {/* Completeness filter + Sort */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-base-content/40">{dict.completeness.label}：</span>
        {COMPLETENESS_OPTIONS.map((val) => (
          <Link
            key={val}
            href={`/app/moments?tab=${currentTab}&completeness=${val}&sort=${sort}`}
            className={`btn btn-xs ${completeness === val || (!completeness && val === "") ? "btn-primary" : "btn-ghost"}`}
          >
            {completenessLabels[val]}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-base-content/40">{dict.comment?.sort || "排序"}：</span>
          {(["latest", "hottest"] as const).map((s) => (
            <Link
              key={s}
              href={`/app/moments?tab=${currentTab}${completeness ? `&completeness=${completeness}` : ""}&sort=${s}`}
              className={`btn btn-xs ${sort === s ? "btn-primary" : "btn-ghost"}`}
            >
              {sortLabels[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Status tabs */}
      <div className="tabs tabs-box mb-4">
        {(["latest", "awaiting", "has_corrections", "adopted"] as TabKey[]).map((t) => (
          <Link
            key={t}
            href={`/app/moments?tab=${t}${completeness ? `&completeness=${completeness}` : ""}&sort=${sort}`}
            className={`tab tab-sm ${currentTab === t ? "tab-active" : ""}`}
          >
            {(dict.feed as any)[TAB_LABELS[t]] || t}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          title={dict.feed.empty}
          action={{ label: dict.feed.emptyAction, href: "/posts/new" }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {entries.map((entry) => (
              <MomentCard
                key={entry.id}
                entry={entry}
                typeLabels={dict.typeLabels}
                completenessLabels={dict.completeness}
                correctionLabel={dict.correction.label}
                adoptedLabel={dict.post.accepted}
                timeLabels={dict.time}
              />
            ))}
          </div>
          {nextCursor && (
            <div className="mt-8 text-center">
              <Link
                href={`/app/moments?tab=${currentTab}${completeness ? `&completeness=${completeness}` : ""}&sort=${sort}&cursor=${nextCursor}`}
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
            <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">{entry.content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-base-content/50">{entry.author.displayName || entry.author.username}</span>
              <span className="text-xs text-base-content/30">·</span>
              <span className="text-xs text-base-content/50">{timeAgo}</span>
              {entry.targetLanguage && <><span className="text-xs text-base-content/30">·</span><Badge variant="default" size="sm">{entry.targetLanguage.nativeName}</Badge></>}
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
