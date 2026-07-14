"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { computeDiff, type DiffSegment } from "@/lib/diff";
import type { Dictionary } from "@/locales";

interface Props {
  id: string; correctedText: string; explanation: string | null; toneNote: string | null;
  isAccepted: boolean; createdAt: Date | string;
  author: { username: string; displayName: string | null; avatarUrl: string | null; };
  originalContent: string; dict: Dictionary;
}

export function CorrectionCard({ correctedText, explanation, toneNote, isAccepted, createdAt, author, originalContent, dict }: Props) {
  const diff = computeDiff(originalContent, correctedText);
  const timeStr = new Date(createdAt).toLocaleDateString("zh-CN");

  return (
    <Card>
      {/* Author header */}
      <div className="flex items-center gap-3 mb-4">
        <UserAvatar username={author.displayName || author.username} size="sm" />
        <div className="flex-1">
          <span className="text-sm font-medium">{author.displayName || author.username}</span>
          <span className="text-xs text-base-content/40 ml-2">{timeStr}</span>
        </div>
        {isAccepted && <Badge variant="success" size="sm">{dict.correction.acceptedBadge}</Badge>}
      </div>

      {/* Diff view */}
      <div className="border border-base-200 rounded-box overflow-hidden">
        <div className="text-xs text-base-content/40 px-3 py-1.5 bg-base-200 font-medium">
          {dict.correction.diffLabel}
        </div>
        <div className="p-3 text-sm leading-relaxed">
          <DiffView segments={diff} />
        </div>
      </div>

      {/* Corrected full text */}
      <div className="mt-3">
        <p className="text-xs text-base-content/40 mb-1">{dict.correction.correctedFull}</p>
        <p className="text-sm text-base-content bg-success/10 border border-success/20 rounded-box p-3 leading-relaxed">
          {correctedText}
        </p>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="mt-3">
          <p className="text-xs text-base-content/40 mb-1">{dict.correction.reason}</p>
          <p className="text-sm text-base-content/70 leading-relaxed bg-base-200 rounded-box p-3">
            {explanation}
          </p>
        </div>
      )}

      {/* Tone note */}
      {toneNote && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-base-content/40">{dict.correction.tone}</span>
          <Badge variant="default" size="sm">
            {dict.toneLabels[toneNote] || toneNote}
          </Badge>
        </div>
      )}
    </Card>
  );
}

// ── Diff View ────────────────────────────────────────

function DiffView({ segments }: { segments: DiffSegment[] }) {
  if (segments.length === 0) return null;

  return (
    <span className="whitespace-pre-wrap">
      {segments.map((seg, i) => {
        if (seg.type === "same") {
          return <span key={i}>{seg.text}</span>;
        }
        if (seg.type === "removed") {
          return (
            <span
              key={i}
              className="bg-error/15 text-error line-through rounded-sm px-0.5"
            >
              {seg.text}
            </span>
          );
        }
        // added
        return (
          <span
            key={i}
            className="bg-success/20 text-success font-semibold rounded-sm px-0.5"
          >
            {seg.text}
          </span>
        );
      })}
    </span>
  );
}
