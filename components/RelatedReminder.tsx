"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getRelatedLibraryItems } from "@/server/queries/library";
import type { Dictionary } from "@/locales";

interface RelatedItem {
  id: string;
  correctedTextSnapshot: string | null;
  explanationSnapshot: string | null;
  toneNoteSnapshot: string | null;
  tags: string[];
  createdAt: string;
  postId: string;
  postExpressionType: string | null | undefined;
  postTone: string | null | undefined;
  score: number;
}

interface Props {
  userId: string;
  expressionType: string;
  tone: string;
  targetLanguageId: string;
  dict: Dictionary;
  onInsert: (text: string) => void;
  currentContent: string;
}

export function RelatedReminder({
  userId, expressionType, tone, targetLanguageId,
  dict, onInsert, currentContent,
}: Props) {
  const [items, setItems] = useState<RelatedItem[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchRelated = useCallback(async () => {
    if (!expressionType && !tone && !targetLanguageId) return;
    setLoading(true);
    const result = await getRelatedLibraryItems({
      userId, expressionType, tone, targetLanguageId,
    });
    setItems(result);
    setLoading(false);
  }, [userId, expressionType, tone, targetLanguageId]);

  // Trigger when type/tone/language change
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(fetchRelated, 600);
    return () => clearTimeout(timer);
  }, [expressionType, tone, targetLanguageId, dismissed]); // eslint-disable-line

  if (dismissed || items.length === 0) return null;

  const handleInsert = (text: string) => {
    const newContent = currentContent
      ? currentContent + "\n" + text
      : text;
    onInsert(newContent);
  };

  return (
    <Card padding="sm" className="bg-primary/5 border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <p className="text-sm text-base-content/70">
            你之前收藏过 {items.length} 条相关表达，要看看吗？
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-xs text-base-content/30 hover:text-base-content shrink-0"
        >
          ✕ 关闭
        </button>
      </div>

      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-xs text-primary hover:underline mt-2"
        >
          展开查看 →
        </button>
      )}

      {expanded && (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="bg-base-100 rounded-box p-3 text-sm">
              <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap line-clamp-3">
                {item.correctedTextSnapshot || item.explanationSnapshot || "—"}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {item.postExpressionType && dict.typeLabels[item.postExpressionType] && (
                  <Badge variant="default" size="sm">{dict.typeLabels[item.postExpressionType]}</Badge>
                )}
                {item.postTone && dict.toneLabels[item.postTone] && (
                  <Badge variant="default" size="sm">{dict.toneLabels[item.postTone]}</Badge>
                )}
                {item.tags.map((t: string) => (
                  <Badge key={t} variant="primary" size="sm">{t}</Badge>
                ))}
                <span className="text-xs text-base-content/30 ml-auto">
                  {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              {item.correctedTextSnapshot && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleInsert(item.correctedTextSnapshot!)}
                >
                  📋 插入作为参考
                </Button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-xs text-base-content/30 hover:text-base-content"
          >
            收起
          </button>
        </div>
      )}
    </Card>
  );
}
