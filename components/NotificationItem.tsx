"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { markOneReadAction } from "@/server/actions/notifications";
import type { Dictionary } from "@/locales";

interface Props { id: string; type: string; title: string; body: string | null; isRead: boolean; relatedPostId: string | null; createdAt: string; dict: Dictionary; }

export function NotificationItem({ id, type, title, body, isRead, relatedPostId, createdAt, dict }: Props) {
  const [read, setRead] = useState(isRead);
  const timeStr = new Date(createdAt).toLocaleDateString("zh-CN");

  const handleClick = async () => {
    if (!read) { setRead(true); const fd = new FormData(); fd.append("id", id); await markOneReadAction(fd); }
  };

  const content = (
    <div className={`flex items-start gap-3 ${!read ? "bg-primary/5 -mx-3 -my-2 p-3 rounded-box" : ""}`} onClick={handleClick}>
      <div className="shrink-0 mt-0.5">{!read && <span className="block w-2 h-2 rounded-full bg-primary" />}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5"><span className="text-sm font-medium">{title}</span><Badge variant="default" size="sm">{dict.notifications.types[type] || type}</Badge></div>
        {body && <p className="text-xs text-base-content/60 line-clamp-2">{body}</p>}
        <p className="text-xs text-base-content/30 mt-1">{timeStr}</p>
      </div>
    </div>
  );

  if (relatedPostId) return <Link href={`/posts/${relatedPostId}`} className="block">{content}</Link>;
  return <div className="block">{content}</div>;
}
