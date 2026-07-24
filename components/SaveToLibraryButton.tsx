"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { saveToLibraryAction } from "@/server/actions/library";
import { useToast } from "@/lib/toast";
import type { Dictionary } from "@/locales";

interface Props {
  correctionId: string; postId: string; isAccepted: boolean; isSaved: boolean; dict: Dictionary;
  suggestedTags?: string[];
}

export function SaveToLibraryButton({ correctionId, postId, isAccepted, isSaved, dict, suggestedTags }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(isSaved);
  const [showInput, setShowInput] = useState(false);
  const [tags, setTags] = useState(suggestedTags?.join("、") || "");
  const { addToast } = useToast();

  if (!isAccepted) return null;
  if (saved) return <span className="text-xs text-success font-medium">{dict.correction.savedToLibrary}</span>;

  const handleSave = async () => {
    setLoading(true); setError(null);
    const fd = new FormData();
    fd.append("correctionId", correctionId);
    fd.append("postId", postId);
    if (tags.trim()) fd.append("tags", tags.trim());
    const result = await saveToLibraryAction({}, fd);
    if (result?.errors?._form) setError(result.errors._form[0]);
    else if (result?.success) { setSaved(true); setShowInput(false); addToast(dict.correction.savedToLibrary); }
    setLoading(false);
  };

  if (!showInput) {
    return (
      <div>
        {error && <Alert variant="error" className="mb-2">{error}</Alert>}
        <Button variant="ghost" size="sm" onClick={() => setShowInput(true)}>
          {dict.correction.saveToLibrary}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 bg-base-100 border border-base-200 rounded-box p-3">
      {error && <Alert variant="error" className="text-xs">{error}</Alert>}
      <Input
        label="私人标签（逗号分隔，可选）"
        placeholder="如: 日常, 工作, 常用表达"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      {suggestedTags && suggestedTags.length > 0 && (
        <p className="text-xs text-ink-muted">推荐: {suggestedTags.join("、")}</p>
      )}
      <div className="flex gap-2">
        <Button size="sm" variant="primary" loading={loading} onClick={handleSave}>保存</Button>
        <Button size="sm" variant="ghost" onClick={() => setShowInput(false)}>取消</Button>
      </div>
    </div>
  );
}
