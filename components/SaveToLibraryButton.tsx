"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { saveToLibraryAction } from "@/server/actions/library";
import { useToast } from "@/lib/toast";
import type { Dictionary } from "@/locales";

interface Props { correctionId: string; postId: string; isAccepted: boolean; isSaved: boolean; dict: Dictionary; }

export function SaveToLibraryButton({ correctionId, postId, isAccepted, isSaved, dict }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(isSaved);
  const { addToast } = useToast();
  if (!isAccepted) return null;
  if (saved) return <span className="text-xs text-success font-medium">{dict.correction.savedToLibrary}</span>;

  const handleSave = async () => {
    setLoading(true); setError(null);
    const fd = new FormData(); fd.append("correctionId", correctionId); fd.append("postId", postId);
    const result = await saveToLibraryAction({}, fd);
    if (result?.errors?._form) setError(result.errors._form[0]);
    else if (result?.success) { setSaved(true); addToast(dict.correction.savedToLibrary); }
    setLoading(false);
  };

  return (
    <div>
      {error && <Alert variant="error" className="mb-2">{error}</Alert>}
      <Button variant="ghost" size="sm" loading={loading} onClick={handleSave}>{dict.correction.saveToLibrary}</Button>
    </div>
  );
}
