"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateLibraryTagsAction } from "@/server/actions/library";
import { useToast } from "@/lib/toast";

export function EditTagsButton({ itemId, currentTags }: { itemId: string; currentTags: string[] }) {
  const [editing, setEditing] = useState(false);
  const [tags, setTags] = useState(currentTags.join("、"));
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  if (!editing) {
    return <button type="button" onClick={() => setEditing(true)} className="text-xs text-base-content/30 hover:text-primary">编辑标签</button>;
  }

  const handleSave = async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append("itemId", itemId);
    if (tags.trim()) fd.append("tags", tags.trim());
    await updateLibraryTagsAction({}, fd);
    addToast("标签已更新");
    setEditing(false);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Input value={tags} onChange={(e) => setTags(e.target.value)} className="input-xs" placeholder="逗号分隔" />
      <Button size="sm" variant="ghost" loading={loading} onClick={handleSave}>保存</Button>
      <button type="button" onClick={() => setEditing(false)} className="text-xs text-base-content/30">取消</button>
    </div>
  );
}
