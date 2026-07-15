"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { removeFromLibraryAction } from "@/server/actions/library";
import { useToast } from "@/lib/toast";
import type { Dictionary } from "@/locales";

export function RemoveFromLibraryButton({ itemId, dict }: { itemId: string; dict: Dictionary }) {
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);
  const { addToast } = useToast();
  if (removed) return null;

  const handleRemove = async () => {
    setLoading(true);
    const fd = new FormData(); fd.append("itemId", itemId);
    await removeFromLibraryAction({}, fd);
    setRemoved(true); setLoading(false); addToast(dict.library.remove + " ✓");
  };

  return <Button variant="ghost" size="sm" loading={loading} onClick={handleRemove}>{dict.library.remove}</Button>;
}
