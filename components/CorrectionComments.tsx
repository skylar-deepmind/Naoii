"use client";

import { useState, useEffect, useCallback } from "react";
import { SlideDrawer } from "@/components/SlideDrawer";
import { CommentSection } from "@/components/CommentSection";
import type { CommentData } from "@/components/CommentItem";

async function fetchCorrectionComments(
  entryId: string,
  correctionId: string,
  currentUserId?: string
): Promise<CommentData[]> {
  const res = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entryId, correctionId, userId: currentUserId }),
  });
  if (!res.ok) return [];
  return res.json();
}

interface Props {
  entryId: string;
  correctionId: string;
  currentUserId?: string;
  dict: Record<string, any>;
  triggerLabel: string;
}

export function CorrectionComments({ entryId, correctionId, currentUserId, dict, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchCorrectionComments(entryId, correctionId, currentUserId);
    setComments(data);
    setLoading(false);
  }, [entryId, correctionId, currentUserId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-base-content/50 hover:text-base-content flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {triggerLabel}
      </button>

      <SlideDrawer open={open} onClose={() => setOpen(false)} title={triggerLabel}>
        {loading ? (
          <p className="text-sm text-base-content/40 text-center py-8">{dict.common.loading}</p>
        ) : (
          <CommentSection
            entryId={entryId}
            correctionId={correctionId}
            initialComments={comments}
            currentUserId={currentUserId}
            dict={dict}
            onRefresh={load}
          />
        )}
      </SlideDrawer>
    </>
  );
}
