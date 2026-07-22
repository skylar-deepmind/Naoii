"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CommentForm } from "@/components/CommentForm";
import { CommentItem } from "@/components/CommentItem";
import type { CommentData } from "@/components/CommentItem";

type SortMode = "time_desc" | "time_asc" | "likes_desc" | "likes_asc";

function sortComments(comments: CommentData[], sort: SortMode): CommentData[] {
  const getVal = (c: CommentData) =>
    sort.startsWith("likes") ? c.likeCount : new Date(c.createdAt).getTime();
  const desc = sort.endsWith("desc");
  return [...comments].sort((a, b) => {
    const va = getVal(a), vb = getVal(b);
    return desc ? vb - va : va - vb;
  });
}

interface Props {
  entryId: string;
  correctionId?: string;
  initialComments: CommentData[];
  currentUserId?: string;
  dict: Record<string, any>;
  onRefresh?: () => void;
}

export function CommentSection({ entryId, correctionId, initialComments, currentUserId, dict, onRefresh }: Props) {
  const router = useRouter();
  const [sort, setSort] = useState<SortMode>("time_desc");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else {
      router.refresh();
    }
  }, [onRefresh, router]);

  const onToggleReply = useCallback((commentId: string) => {
    setActiveReplyId((prev) => (prev === commentId ? null : commentId));
  }, []);

  const sorted = useMemo(() => sortComments(initialComments, sort), [initialComments, sort]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-base-content/50">{dict.comment?.sort || "排序"}：</span>
        {([
          { value: "time_desc" as const, label: dict.comment?.newest || "最新" },
          { value: "time_asc" as const, label: dict.comment?.oldest || "最早" },
          { value: "likes_desc" as const, label: dict.comment?.mostLiked || "点赞最多" },
          { value: "likes_asc" as const, label: dict.comment?.leastLiked || "点赞最少" },
        ]).map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSort(opt.value)}
            className={`btn btn-xs ${sort === opt.value ? "btn-primary" : "btn-ghost"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {currentUserId && (
        <CommentForm entryId={entryId} correctionId={correctionId} dict={dict} onSuccess={refresh} />
      )}

      {sorted.length === 0 ? (
        <p className="text-sm text-base-content/40 text-center py-8">
          {dict.comment?.empty || "暂无评论"}
        </p>
      ) : (
        <div className="space-y-3 mt-4">
          {sorted.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              entryId={entryId}
              correctionId={correctionId}
              currentUserId={currentUserId}
              dict={dict}
              depth={0}
              activeReplyId={activeReplyId}
              onToggleReply={onToggleReply}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
