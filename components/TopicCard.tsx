import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { TopicStatus } from "@/server/queries/topic";

interface TopicCardProps {
  topic: {
    id: string;
    slug: string;
    name: string;
    coverImage: string | null;
    description: string;
    isPermanent: boolean;
    status: TopicStatus;
    entryCount: number;
  };
  dict: Record<string, any>;
}

const statusLabelMap: Record<TopicStatus, { key: string; variant: "success" | "warning" | "error" | "default" }> = {
  ACTIVE: { key: "active", variant: "success" },
  UPCOMING: { key: "upcoming", variant: "warning" },
  ENDED: { key: "ended", variant: "default" },
  CLOSED: { key: "closed", variant: "error" },
};

export function TopicCard({ topic, dict }: TopicCardProps) {
  const t = dict.topics || {};
  const statusInfo = statusLabelMap[topic.status];
  const statusLabel = t.status?.[statusInfo.key] || statusInfo.key;

  return (
    <Link href={`/topics/${topic.slug}`}>
      <Card hover className="h-full">
        {topic.coverImage ? (
          <div className="relative h-32 -mx-4 -mt-4 mb-3 overflow-hidden rounded-t-box">
            <img src={topic.coverImage} alt={topic.name} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 flex gap-1">
              {topic.isPermanent && (
                <Badge variant="default" size="sm">{t.permanent || "常驻"}</Badge>
              )}
              <Badge variant={statusInfo.variant} size="sm">{statusLabel}</Badge>
            </div>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-2">
            {topic.isPermanent && (
              <Badge variant="default" size="sm">{t.permanent || "常驻"}</Badge>
            )}
            <Badge variant={statusInfo.variant} size="sm">{statusLabel}</Badge>
          </div>
        )}
        <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-1">{topic.name}</h3>
        <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2 mb-3">{topic.description}</p>
        <div className="flex items-center gap-2 text-xs text-base-content/40">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>{topic.entryCount} {t.participants || "参与人数"}</span>
        </div>
      </Card>
    </Link>
  );
}
