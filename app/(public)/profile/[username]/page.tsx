import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserByUsername, getUserProfileStats, getUserPosts, getUserCorrections, getUserAdoptedCorrections } from "@/server/queries/user";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

interface Props { params: Promise<{ username: string }>; searchParams: Promise<{ tab?: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

type ProfileTab = "posts" | "corrections" | "adopted";

function isValidTab(tab: string): tab is ProfileTab {
  return ["posts", "corrections", "adopted"].includes(tab);
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { tab = "posts" } = await searchParams;
  const activeTab: ProfileTab = isValidTab(tab) ? tab : "posts";

  const user = await getUserByUsername(username);
  const dict = await getDict();
  if (!user) notFound();

  const stats = await getUserProfileStats(username);
  const profile = user.profile!;

  // Load content based on active tab
  let contentItems: any[] = [];
  if (activeTab === "posts") contentItems = await getUserPosts(user.id);
  else if (activeTab === "corrections") contentItems = await getUserCorrections(user.id);
  else if (activeTab === "adopted") contentItems = await getUserAdoptedCorrections(user.id);

  const tabs: { key: ProfileTab; label: string; count: number; color: string }[] = [
    { key: "posts", label: dict.profile.posts, count: stats?.postCount ?? 0, color: "text-primary" },
    { key: "corrections", label: dict.profile.corrections, count: stats?.correctionCount ?? 0, color: "" },
    { key: "adopted", label: dict.profile.adopted, count: stats?.adoptedCount ?? 0, color: "text-success" },
  ];

  // Reputation is display-only (not a tab)
  const repCard = (
    <Card padding="sm">
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">{stats?.reputationScore ?? 0}</p>
        <p className="text-xs text-base-content/60 mt-1">{dict.profile.reputation}</p>
      </div>
    </Card>
  );

  return (
    <AppShell>
      <div className="py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
          <UserAvatar username={user.username} src={profile.avatarUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{profile.displayName || user.username}</h1>
            <p className="text-base-content/60 text-sm">@{user.username}</p>
            {profile.bio && <p className="mt-3 text-sm leading-relaxed max-w-lg">{profile.bio}</p>}
          </div>
        </div>

        {/* Stats — reputation is display-only, others are clickable tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          
          {tabs.map((t) => (
            <Link key={t.key} href={`/profile/${username}?tab=${t.key}`}>
              <Card padding="sm" hover>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${t.color} ${activeTab === t.key ? "" : ""}`}>
                    {t.count}
                  </p>
                  <p className={`text-xs mt-1 ${activeTab === t.key ? "text-base-content font-medium" : "text-base-content/60"}`}>
                    {t.label}
                  </p>
                  {activeTab === t.key && (
                    <div className="w-8 h-0.5 bg-primary mx-auto mt-1.5 rounded-full" />
                  )}
                </div>
              </Card>
            </Link>
          ))}

          {repCard}
        </div>

        {/* Learning info */}
        <Card className="mb-8">
          <h2 className="font-semibold text-base mb-4">{dict.profile.learningInfo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-base-content/50 text-xs mb-0.5">{dict.profile.nativeLang}</p><p className="flex items-center gap-1.5">{profile.nativeLanguage ? <Badge variant="default" size="sm">{profile.nativeLanguage.nativeName}</Badge> : <span className="text-base-content/40">{dict.profile.notSet}</span>}</p></div>
            <div><p className="text-base-content/50 text-xs mb-0.5">{dict.profile.learningLang}</p><p className="flex items-center gap-1.5">{profile.learningLanguage ? <Badge variant="primary" size="sm">{profile.learningLanguage.nativeName}</Badge> : <span className="text-base-content/40">{dict.profile.notSet}</span>}</p></div>
            <div><p className="text-base-content/50 text-xs mb-0.5">{dict.auth.level}</p><p className="flex items-center gap-1.5">{profile.level ? <Badge variant="success" size="sm">{dict.level[profile.level as keyof typeof dict.level] || profile.level}</Badge> : <span className="text-base-content/40">{dict.profile.notSet}</span>}</p></div>
          </div>
        </Card>

        {/* Tab content */}
        <h2 className="font-semibold text-lg mb-4">
          {activeTab === "posts" ? dict.profile.posts : activeTab === "corrections" ? dict.profile.corrections : dict.profile.adopted}
          {" · "}{tabs.find(t => t.key === activeTab)?.count ?? 0}
        </h2>

        {contentItems.length === 0 ? (
          <EmptyState
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
            title={activeTab === "posts" ? dict.profile.noPosts : dict.profile.noPosts}
            description={activeTab === "posts" ? dict.profile.noPostsDesc : ""}
          />
        ) : activeTab === "posts" ? (
          <div className="space-y-3">
            {contentItems.map((post: any) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <Card hover>
                  {post.title && <h3 className="font-semibold text-sm mb-1">{post.title}</h3>}
                  <p className="text-sm text-base-content/70 line-clamp-3">{post.content}</p>
                  <CardFooter>
                    <span className="text-xs text-base-content/40">{post.targetLanguage?.nativeName}</span>
                    <span className="text-xs text-base-content/30">{post._count?.corrections ?? 0} {dict.correction.label}</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {contentItems.map((c: any) => (
              <Link key={c.id} href={`/posts/${c.post?.id || c.postId}`}>
                <Card hover>
                  <p className="text-sm text-base-content/70 line-clamp-2">{c.correctedText}</p>
                  <CardFooter>
                    <span className="text-xs text-base-content/40 truncate">{c.post?.title || c.post?.content?.slice(0, 50) || c.postId}</span>
                    {c.isAccepted && <Badge variant="success" size="sm">{dict.post.accepted}</Badge>}
                    <span className="text-xs text-base-content/30 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
