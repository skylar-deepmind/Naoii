import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUserByUsername, getUserProfileStats } from "@/server/queries/user";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

interface Props { params: Promise<{ username: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  const dict = await getDict();
  if (!user) notFound();

  const stats = await getUserProfileStats(username);
  const profile = user.profile!;

  return (
    <AppShell>
      <div className="py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-8">
          <UserAvatar username={user.username} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{profile.displayName || user.username}</h1>
            <p className="text-base-content/60 text-sm">@{user.username}</p>
            {profile.bio && <p className="mt-3 text-sm leading-relaxed max-w-lg">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold text-primary">{stats?.reputationScore ?? 0}</p><p className="text-xs text-base-content/60 mt-1">{dict.profile.reputation}</p></div></Card>
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold">{stats?.postCount ?? 0}</p><p className="text-xs text-base-content/60 mt-1">{dict.profile.posts}</p></div></Card>
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold">{stats?.correctionCount ?? 0}</p><p className="text-xs text-base-content/60 mt-1">{dict.profile.corrections}</p></div></Card>
          <Card padding="sm"><div className="text-center"><p className="text-2xl font-bold text-success">{stats?.adoptedCount ?? 0}</p><p className="text-xs text-base-content/60 mt-1">{dict.profile.adopted}</p></div></Card>
        </div>

        <Card>
          <h2 className="font-semibold text-base mb-4">{dict.profile.learningInfo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div><p className="text-base-content/50 text-xs mb-0.5">{dict.profile.nativeLang}</p><p className="flex items-center gap-1.5">{profile.nativeLanguage ? <Badge variant="default" size="sm">{profile.nativeLanguage.nativeName}</Badge> : <span className="text-base-content/40">{dict.profile.notSet}</span>}</p></div>
            <div><p className="text-base-content/50 text-xs mb-0.5">{dict.profile.learningLang}</p><p className="flex items-center gap-1.5">{profile.learningLanguage ? <Badge variant="primary" size="sm">{profile.learningLanguage.nativeName}</Badge> : <span className="text-base-content/40">{dict.profile.notSet}</span>}</p></div>
            <div><p className="text-base-content/50 text-xs mb-0.5">{dict.auth.level}</p><p className="flex items-center gap-1.5">{profile.level ? <Badge variant="success" size="sm">{dict.level[profile.level as keyof typeof dict.level] || profile.level}</Badge> : <span className="text-base-content/40">{dict.profile.notSet}</span>}</p></div>
          </div>
        </Card>

        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-4">{dict.post.corrections}</h2>
          <EmptyState icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} title={dict.profile.noPosts} description={dict.profile.noPostsDesc} />
        </div>
      </div>
    </AppShell>
  );
}
