"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { createTopicCommentAction } from "@/server/actions/topic-comment";
import { toggleCommentLikeAction } from "@/server/actions/like";
import type { Dictionary } from "@/locales";

interface CommentData {
  id: string;
  body: string;
  likeCount: number;
  parentId: string | null;
  createdAt: Date | string;
  liked: boolean;
  author: {
    id: string;
    username: string;
    profile?: { displayName: string | null; avatarUrl: string | null } | null;
  };
  children: CommentData[];
}

interface Props {
  topicId: string;
  initialComments: CommentData[];
  currentUserId?: string;
  sort: string;
  dict: Dictionary;
}

export function TopicDiscussion({ topicId, initialComments, currentUserId, sort, dict }: Props) {
  const [body, setBody] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const sortLabels = {
    time_desc: dict.comment?.newest || "最新",
    time_asc: dict.comment?.oldest || "最早",
    likes_desc: dict.comment?.mostLiked || "点赞最多",
    likes_asc: dict.comment?.leastLiked || "点赞最少",
  };

  const handleSubmit = () => {
    if (!body.trim() || isPending) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("topicId", topicId);
      fd.append("body", body);
      const result = await createTopicCommentAction({}, fd);
      if (result?.success) {
        setBody("");
        window.location.reload();
      }
    });
  };

  const handleReply = (parentId: string) => {
    if (!replyBody.trim() || isPending) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.append("topicId", topicId);
      fd.append("body", replyBody);
      fd.append("parentId", parentId);
      const result = await createTopicCommentAction({}, fd);
      if (result?.success) {
        setReplyBody("");
        setReplyingTo(null);
        window.location.reload();
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Sort tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(sortLabels).map(([value, label]) => (
          <a
            key={value}
            href={`?tab=discussion&sort=${value}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              sort === value
                ? "bg-primary text-primary-content border-primary"
                : "border-base-300 text-ink-muted hover:border-base-400"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Reply form */}
      {currentUserId ? (
        <Card padding="sm">
          <div className="flex gap-3">
            <div className="shrink-0 mt-1">
              <UserAvatar username={currentUserId} size="sm" />
            </div>
            <div className="flex-1">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={dict.comment?.placeholder || "写下你的看法..."}
                className="textarea textarea-bordered w-full min-h-20 text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isPending || !body.trim()}>
                  {isPending ? (dict.common?.loading || "发送中...") : (dict.topics?.postDiscussion || "发表看法")}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="sm">
          <p className="text-sm text-ink-muted text-center py-4">
            <Link href="/login" className="text-primary hover:underline">{dict.auth?.goLogin || "登录"}</Link>
            {" "}{dict.topics?.loginToDiscuss || "后参与讨论"}
          </p>
        </Card>
      )}

      {/* Discussion list */}
      <div className="space-y-3">
        {initialComments.length === 0 ? (
          <Card padding="sm">
            <p className="text-sm text-ink-muted text-center py-8">{dict.topics?.noDiscussion || "暂无讨论，来说点什么吧"}</p>
          </Card>
        ) : (
          initialComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              replyingTo={replyingTo}
              onReply={setReplyingTo}
              replyBody={replyBody}
              onReplyBodyChange={setReplyBody}
              onReplySubmit={handleReply}
              isPending={isPending}
              dict={dict}
              depth={0}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  currentUserId,
  replyingTo,
  onReply,
  replyBody,
  onReplyBodyChange,
  onReplySubmit,
  isPending,
  dict,
  depth,
}: {
  comment: CommentData;
  currentUserId?: string;
  replyingTo: string | null;
  onReply: (id: string | null) => void;
  replyBody: string;
  onReplyBodyChange: (v: string) => void;
  onReplySubmit: (parentId: string) => void;
  isPending: boolean;
  dict: Dictionary;
  depth: number;
}) {
  const authorName = comment.author.profile?.displayName || comment.author.username;
  const avatarUrl = comment.author.profile?.avatarUrl;
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(comment.liked);
  const [optimisticCount, setOptimisticCount] = useOptimistic(comment.likeCount);

  const handleLike = () => {
    if (!currentUserId) return;
    setOptimisticLiked(!optimisticLiked);
    setOptimisticCount(optimisticCount + (optimisticLiked ? -1 : 1));
    const fd = new FormData();
    fd.append("commentId", comment.id);
    toggleCommentLikeAction({}, fd);
  };

  const timeStr = new Date(comment.createdAt).toLocaleDateString();

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-base-200" : ""}>
      <Card padding="sm">
        <div className="flex items-start gap-2">
          <Link href={`/profile/${comment.author.username}`} className="shrink-0">
            <UserAvatar username={authorName} src={avatarUrl} size="sm" className="mt-0.5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/profile/${comment.author.username}`} className="text-sm font-medium hover:underline">
                {authorName}
              </Link>
              <span className="text-xs text-ink-faint">{timeStr}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleLike}
                disabled={!currentUserId}
                className={`flex items-center gap-1 text-xs ${optimisticLiked ? "text-primary font-semibold" : "text-ink-muted hover:text-base-content"} ${!currentUserId ? "cursor-default" : ""}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={optimisticLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {optimisticCount > 0 && <span>{optimisticCount}</span>}
              </button>
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
                  className="text-xs text-ink-muted hover:text-base-content"
                >
                  {dict.comment?.reply || "回复"}
                </button>
              )}
            </div>
            {replyingTo === comment.id && (
              <div className="mt-3">
                <textarea
                  value={replyBody}
                  onChange={(e) => onReplyBodyChange(e.target.value)}
                  placeholder={`${dict.comment?.replyTo || "回复"} ${authorName}...`}
                  className="textarea textarea-bordered w-full text-sm min-h-16 resize-none"
                  rows={2}
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => onReply(null)}
                    className="text-xs text-ink-muted hover:text-base-content"
                  >
                    {dict.common?.cancel || "取消"}
                  </button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onReplySubmit(comment.id)}
                    disabled={isPending || !replyBody.trim()}
                  >
                    {isPending ? (dict.common?.loading || "发送中...") : (dict.comment?.submit || "回复")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
      {comment.children?.map((child) => (
        <CommentItem
          key={child.id}
          comment={child}
          currentUserId={currentUserId}
          replyingTo={replyingTo}
          onReply={onReply}
          replyBody={replyBody}
          onReplyBodyChange={onReplyBodyChange}
          onReplySubmit={onReplySubmit}
          isPending={isPending}
          dict={dict}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}
