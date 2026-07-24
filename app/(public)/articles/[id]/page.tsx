import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LikeButton } from "@/components/LikeButton";
import { CommentSection } from "@/components/CommentSection";
import { getEntryById } from "@/server/queries/entry";
import { getEntryLikeCount, getEntryLikeStatus } from "@/server/actions/like";
import { getCommentsSorted, getCommentCount } from "@/server/queries/comment";
import { getCurrentUser } from "@/lib/auth";
import { getLocale, getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const entry = await getEntryById(id);
  if (!entry || entry.type !== "ARTICLE") return { title: "Article not found" };
  return { title: entry.title || "Read Article" };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const entry = await getEntryById(id);
  const currentUser = await getCurrentUser();
  const dict = await getDict();
  const locale = await getLocale();

  if (!entry || entry.type !== "ARTICLE") notFound();

  const isAuthor = currentUser?.id === entry.author.id;

  if (entry.status !== "PUBLISHED" && !isAuthor) notFound();
  if (entry.visibility === "PRIVATE" && !isAuthor) notFound();

  const [likeCount, liked, commentCount, comments] = await Promise.all([
    getEntryLikeCount(id),
    currentUser ? getEntryLikeStatus(id, currentUser.id) : Promise.resolve(false),
    getCommentCount(id),
    getCommentsSorted(id, "time_desc", currentUser?.id),
  ]);

  const tags: string[] = (await prisma.entry.findUnique({ where: { id }, select: { tags: true } }))?.tags as string[] ?? [];
  const timeStr = new Date(entry.publishedAt || entry.createdAt).toLocaleString(
    locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "zh-CN",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  );

  return (
    <AppShell>
      <article className="py-8 max-w-3xl mx-auto">
        <Link href="/feed" className="text-sm text-ink-muted hover:text-base-content mb-6 inline-block">
          ← {dict.post.backToFeed}
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-6">
          {entry.title || dict.common.placeholder}
        </h1>

        {/* Author & meta */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-base-200">
          <Link href={`/profile/${entry.author.username}`}>
            <UserAvatar
              username={entry.author.profile?.displayName || entry.author.username}
              src={entry.author.profile?.avatarUrl}
              size="md"
            />
          </Link>
          <div className="min-w-0">
            <Link href={`/profile/${entry.author.username}`} className="font-semibold hover:underline">
              {entry.author.profile?.displayName || entry.author.username}
            </Link>
            <p className="text-sm text-ink-muted">{timeStr}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {entry.visibility !== "PUBLIC" && (
              <Badge variant="default" size="sm">
                {dict.visibilityLabels[entry.visibility] || entry.visibility}
              </Badge>
            )}
            {entry.status !== "PUBLISHED" && (
              <Badge variant="warning" size="sm">{dict.article?.draft || "草稿"}</Badge>
            )}
            <LikeButton entryId={id} initialLiked={liked} initialCount={likeCount} />
            {isAuthor && (
              <Link href={`/articles/${entry.id}/edit`} className="btn btn-sm btn-ghost">
                {dict.common.edit}
              </Link>
            )}
          </div>
        </div>

        {entry.coverImage && (
          <div className="mb-8 -mx-4 sm:mx-0">
            <img
              src={entry.coverImage}
              alt={entry.title || ""}
              className="w-full max-h-80 object-cover rounded-box"
            />
          </div>
        )}

        <div className="prose prose-base max-w-none">
          <div className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
            {entry.content}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-base-200">
            {tags.map((tag: string) => (
              <Link key={tag} href={`/feed?tag=${tag}`}>
                <Badge variant="primary" size="sm">{tag}</Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="mt-10 pt-6 border-t border-base-200">
          <h2 className="text-xl font-bold mb-4">{dict.comment?.title || "评论"} ({commentCount})</h2>
          <CommentSection
            entryId={id}
            initialComments={comments}
            currentUserId={currentUser?.id}
            dict={dict as any}
          />
        </div>
      </article>
    </AppShell>
  );
}
