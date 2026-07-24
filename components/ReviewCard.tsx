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
  dict: { library: { original: string; corrected: string; reason: string }; correction: { correctedFull: string; reason: string }; review: { reviewCount: string; clickToReveal: string; mastered: string; keepReviewing: string; skip: string } };
}

export function ReviewCard({
  id, originalTextSnapshot, correctedTextSnapshot, explanationSnapshot,
  tags, reviewCount, postExpressionType, postTone, typeLabels, toneLabels, dict,
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
      <div className="text-xs text-ink-faint mb-2">
        {dict.review.reviewCount}: {reviewCount}
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
          📝 {dict.review.clickToReveal}
        </Button>
      ) : (
        <div className="space-y-2">
          {correctedTextSnapshot && (
            <div className="bg-success/5 border border-success/20 rounded-box p-3">
              <p className="text-xs text-ink-faint mb-1">{dict.correction.correctedFull}</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{correctedTextSnapshot}</p>
            </div>
          )}
          {explanationSnapshot && (
            <div className="bg-base-200 rounded-box p-3">
              <p className="text-xs text-ink-faint mb-1">{dict.correction.reason}</p>
              <p className="text-sm text-foreground/70 leading-relaxed">{explanationSnapshot}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {revealed && (
        <div className="flex gap-2 mt-3">
          <Button variant="success" size="sm" loading={loading} onClick={() => handleMark("mastered")}>
            ✓ {dict.review.mastered}
          </Button>
          <Button variant="warning" size="sm" loading={loading} onClick={() => handleMark("review")}>
            🔄 {dict.review.keepReviewing}
          </Button>
          <Button variant="ghost" size="sm" loading={loading} onClick={() => handleMark("skip")}>
            {dict.review.skip}
          </Button>
        </div>
      )}
    </Card>
  );
}
