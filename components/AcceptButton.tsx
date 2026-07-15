"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { acceptCorrectionAction } from "@/server/actions/acceptance";
import { useToast } from "@/lib/toast";
import type { Dictionary } from "@/locales";

interface Props { correctionId: string; postId: string; isAlreadyAccepted: boolean; postHasAccepted: boolean; dict: Dictionary; }

export function AcceptButton({ correctionId, postId, isAlreadyAccepted, postHasAccepted, dict }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  if (isAlreadyAccepted || postHasAccepted) return null;

  const handleAccept = async () => {
    setLoading(true); setError(null);
    const fd = new FormData(); fd.append("correctionId", correctionId); fd.append("postId", postId);
    const result = await acceptCorrectionAction({}, fd);
    if (result?.errors?._form) { setError(result.errors._form[0]); }
    else if (result?.success) { addToast(dict.correction.acceptButton + " ✓"); }
    setLoading(false);
  };

  return (
    <div>
      {error && <Alert variant="error" className="mb-2">{error}</Alert>}
      <Button variant="success" size="sm" loading={loading} onClick={handleAccept}>{dict.correction.acceptButton}</Button>
    </div>
  );
}
