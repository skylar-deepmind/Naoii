"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface PostCardProps {
  id: string;
  title: string | null;
  content: string;
  expressionType: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  targetLanguage: {
    id: string;
    name: string;
    nativeName: string;
  } | null;
  correctionCount: number;
  hasAdoptedCorrection: boolean;
  completeness?: string | null;
  completenessLabels?: Record<string, string>;
  // Translation labels
  typeLabels?: Record<string, string>;
  correctionLabel?: string;
  adoptedLabel?: string;
  timeLabels?: Record<string, string>;
}

export function PostCard({
  id,
  title,
  content,
  expressionType,
  createdAt,
  author,
  targetLanguage,
  correctionCount,
  hasAdoptedCorrection,
  completeness,
  completenessLabels = {},
  typeLabels = {},
  timeLabels = {},
  correctionLabel = "修改",
  adoptedLabel = "已采纳",
}: PostCardProps) {
  const timeAgo = formatTimeAgo(createdAt, timeLabels);

  return (
    <Link href={`/posts/${id}`}>
      <Card hover>
        <div className="flex items-start gap-3">
          <UserAvatar username={author.displayName || author.username} size="sm" className="mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            {title && <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{title}</h3>}
            <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">{content}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-base-content/50">{author.displayName || author.username}</span>
              <span className="text-xs text-base-content/30">·</span>
              <span className="text-xs text-base-content/50">{timeAgo}</span>
              {targetLanguage && <><span className="text-xs text-base-content/30">·</span><Badge variant="default" size="sm">{targetLanguage.nativeName}</Badge></>}
              {completeness && completenessLabels[completeness] && <Badge variant={completeness === "PARTIAL" ? "warning" : completeness === "IDEA_ONLY" ? "error" : "default"} size="sm">{completenessLabels[completeness]}</Badge>}
              {expressionType && typeLabels[expressionType] && <Badge variant="default" size="sm">{typeLabels[expressionType]}</Badge>}
              {correctionCount > 0 && <Badge variant="primary" size="sm">{correctionCount} {correctionLabel}</Badge>}
              {hasAdoptedCorrection && <Badge variant="success" size="sm">{adoptedLabel}</Badge>}
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
