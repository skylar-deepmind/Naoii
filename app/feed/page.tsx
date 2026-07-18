import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PostCard } from "@/components/PostCard";
import { FeedTabs } from "@/components/FeedTabs";
import { getCurrentUser } from "@/lib/auth";
import { getFeedPosts } from "@/server/queries/post";
import { getDict } from "@/lib/i18n";

type TabKey = "latest" | "awaiting" | "has_corrections" | "adopted";

function isValidTab(tab: string): tab is TabKey {
  return ["latest", "awaiting", "has_corrections", "adopted"].includes(tab);
}

interface Props {
  searchParams: Promise<{ tab?: string; cursor?: string; completeness?: string }>;
}

export default async function FeedPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const dict = await getDict();
  const { tab = "latest", cursor, completeness } = await searchParams;
  const currentTab = isValidTab(tab) ? tab : "latest";
  const { posts, nextCursor } = await getFeedPosts({ tab: currentTab, completeness, cursor });

  return (
    <AppShell>
      <PageHeader
        title={dict.feed.title}
        description={dict.feed.desc}
        action={
          <Link href="/posts/new"><Button variant="primary" size="sm">{dict.nav.postNew}</Button></Link>
        }
      />

      <FeedTabs dict={dict} />

      {posts.length === 0 ? (
        <EmptyState
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          title={dict.feed.empty}
          action={{ label: dict.feed.emptyAction, href: "/posts/new" }}
        />
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} typeLabels={dict.typeLabels} completenessLabels={dict.completeness} correctionLabel={dict.correction.label} adoptedLabel={dict.post.accepted} timeLabels={dict.time} />
            ))}
          </div>
          {nextCursor && (
            <div className="mt-8 text-center">
              <Link href={`/feed?tab=${currentTab}&cursor=${nextCursor}`}>
                <Button variant="outline" size="md">{dict.feed.loadMore}</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </AppShell>
  );
}
