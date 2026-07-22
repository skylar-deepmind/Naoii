"use client";

import { useState, useTransition } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Card } from "@/components/ui/Card";
import { CommentForm } from "@/components/CommentForm";
import { deleteCommentAction, toggleCommentLikeAction } from "@/server/actions/like";

export interface CommentData {
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
  comment: CommentData;
  entryId: string;
  correctionId?: string;
  currentUserId?: string;
  dict: Record<string, any>;
  depth: number;
  activeReplyId: string | null;
  onToggleReply: (commentId: string) => void;
  onRefresh: () => void;
}

export function CommentItem({
  comment,
  entryId,
  correctionId,
  currentUserId,
  dict,
  depth,
  activeReplyId,
  onToggleReply,
  onRefresh,
}: Props) {
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [liked, setLiked] = useState(comment.liked);
  const [pending, start] = useTransition();

  const isReplying = activeReplyId === comment.id;

  const handleLike = () => {
    start(async () => {
      const fd = new FormData();
      fd.append("commentId", comment.id);
      const result = await toggleCommentLikeAction({}, fd);
      if (result.liked !== undefined) {
        setLiked(result.liked);
        setLikeCount(result.newCount ?? 0);
      }
    });
  };

  const handleDelete = () => {
    start(async () => {
      const fd = new FormData();
      fd.append("commentId", comment.id);
      const result = await deleteCommentAction({}, fd);
      if (result?.success) onRefresh();
    });
  };

  const timeStr = new Date(comment.createdAt).toLocaleDateString();
  const authorName = comment.author.profile?.displayName || comment.author.username;
  const avatarUrl = comment.author.profile?.avatarUrl;

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l-2 border-base-200" : ""}>
      <Card padding="sm">
        <div className="flex items-start gap-2">
          <UserAvatar username={authorName} src={avatarUrl} size="sm" className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{authorName}</span>
              <span className="text-xs text-base-content/40">{timeStr}</span>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.body}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={handleLike}
                disabled={pending || !currentUserId}
                className={`flex items-center gap-1 text-xs ${liked ? "text-primary font-semibold" : "text-base-content/50 hover:text-base-content"} ${!currentUserId ? "cursor-default" : ""}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
              {currentUserId && (
                <button
                  type="button"
                  onClick={() => onToggleReply(comment.id)}
                  className={`text-xs hover:text-base-content ${isReplying ? "text-primary font-semibold" : "text-base-content/50"}`}
                >
                  {dict.comment?.reply || "回复"}
                </button>
              )}
              {currentUserId === comment.author.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={pending}
                  className="text-xs text-base-content/30 hover:text-error ml-auto"
                >
                  {dict.common.delete}
                </button>
              )}
            </div>
            {isReplying && (
              <CommentForm
                entryId={entryId}
                parentId={comment.id}
                correctionId={correctionId}
                dict={dict}
                onSuccess={() => {
                  onToggleReply(comment.id);
                  onRefresh();
                }}
                placeholder={`${dict.comment?.replyTo || "回复"} ${authorName}`}
                onCancel={() => onToggleReply(comment.id)}
              />
            )}
          </div>
        </div>
      </Card>
      {comment.children.length > 0 && (
        <div className="space-y-2 mt-2">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              entryId={entryId}
              correctionId={correctionId}
              currentUserId={currentUserId}
              dict={dict}
              depth={depth + 1}
              activeReplyId={activeReplyId}
              onToggleReply={onToggleReply}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
