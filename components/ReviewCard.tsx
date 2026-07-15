"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { markReviewAction } from "@/server/actions/review";

interface Props {
  id: string;
  originalTextSnapshot: string;
  correctedTextSnapshot: string | null;
  explanationSnapshot: string | null;
  toneNoteSnapshot: string | null;
  tags: string[];
  reviewCount: number;
  postExpressionType: string | null | undefined;
  postTone: string | null | undefined;
  typeLabels: Record<string, string>;
  toneLabels: Record<string, string>;
}

export function ReviewCard({
  id,
  originalTextSnapshot,
  correctedTextSnapshot,
  explanationSnapshot,
  tags,
  reviewCount,
  postExpressionType,
  postTone,
  typeLabels,
  toneLabels,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMark = async (status: string) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("itemId", id);
    fd.append("status", status);
    await markReviewAction({}, fd);
    setDone(true);
    setLoading(false);
  };

  if (done) return null;

  return (
    <Card padding="sm">
      <div className="text-xs text-base-content/30 mb-2">
        复习次数: {reviewCount}
      </div>

      {/* Original expression (always shown) */}
      <p className="text-sm bg-base-200 rounded-box p-3 leading-relaxed whitespace-pre-wrap mb-2">
        {originalTextSnapshot}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {postExpressionType && typeLabels[postExpressionType] && (
          <Badge variant="default" size="sm">{typeLabels[postExpressionType]}</Badge>
        )}
        {postTone && toneLabels[postTone] && (
          <Badge variant="default" size="sm">{toneLabels[postTone]}</Badge>
        )}
        {tags.map((t: string) => (
          <Badge key={t} variant="primary" size="sm">{t}</Badge>
        ))}
      </div>

      {/* Reveal area */}
      {!revealed ? (
        <Button variant="outline" size="sm" onClick={() => setRevealed(true)}>
          📝 点击查看答案
        </Button>
      ) : (
        <div className="space-y-2">
          {correctedTextSnapshot && (
            <div className="bg-success/5 border border-success/20 rounded-box p-3">
              <p className="text-xs text-base-content/40 mb-1">修改后的表达</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{correctedTextSnapshot}</p>
            </div>
          )}
          {explanationSnapshot && (
            <div className="bg-base-200 rounded-box p-3">
              <p className="text-xs text-base-content/40 mb-1">修改理由</p>
              <p className="text-sm text-base-content/70 leading-relaxed">{explanationSnapshot}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {revealed && (
        <div className="flex gap-2 mt-3">
          <Button variant="success" size="sm" loading={loading} onClick={() => handleMark("mastered")}>
            ✓ 已掌握
          </Button>
          <Button variant="warning" size="sm" loading={loading} onClick={() => handleMark("review")}>
            🔄 继续复习
          </Button>
          <Button variant="ghost" size="sm" loading={loading} onClick={() => handleMark("skip")}>
            跳过
          </Button>
        </div>
      )}
    </Card>
  );
}
