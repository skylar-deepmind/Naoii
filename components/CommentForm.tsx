"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { createCommentAction } from "@/server/actions/like";

interface Props {
  entryId: string;
  parentId?: string;
  correctionId?: string;
  dict: Record<string, any>;
  onSuccess: () => void;
  placeholder?: string;
  onCancel?: () => void;
}

export function CommentForm({ entryId, parentId, correctionId, dict, onSuccess, placeholder, onCancel }: Props) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const handleSubmit = () => {
    if (!body.trim()) {
      setError(dict.comment?.emptyBody || "请输入评论");
      return;
    }
    start(async () => {
      const fd = new FormData();
      fd.append("entryId", entryId);
      fd.append("body", body);
      if (parentId) fd.append("parentId", parentId);
      if (correctionId) fd.append("correctionId", correctionId);
      const result = await createCommentAction({}, fd);
      if (result?.errors) {
        setError(result.errors._form?.[0] || dict.comment?.submitFailed || "评论失败");
      } else {
        setBody("");
        setError("");
        onSuccess();
      }
    });
  };

  return (
    <div className={parentId ? "mt-2" : "mb-4"}>
      <Textarea
        placeholder={placeholder || dict.comment?.placeholder || "写下你的评论..."}
        rows={parentId ? 2 : 3}
        value={body}
        onChange={(e) => { setBody(e.target.value); setError(""); }}
      />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
      <div className="flex gap-2 mt-2">
        <Button variant="primary" size="sm" loading={pending} onClick={handleSubmit}>
          {dict.comment?.submit || "发表"}
        </Button>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {dict.common.cancel}
          </Button>
        )}
      </div>
    </div>
  );
}
