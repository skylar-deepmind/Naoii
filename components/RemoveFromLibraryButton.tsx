"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { removeFromLibraryAction } from "@/server/actions/library";
import type { Dictionary } from "@/locales";

export function RemoveFromLibraryButton({ itemId, dict }: { itemId: string; dict: Dictionary }) {
  const [loading, setLoading] = useState(false);
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  const handleRemove = async () => {
    setLoading(true);
    const fd = new FormData(); fd.append("itemId", itemId);
    await removeFromLibraryAction({}, fd);
    setRemoved(true); setLoading(false);
  };

  return <Button variant="ghost" size="sm" loading={loading} onClick={handleRemove}>{dict.library.remove}</Button>;
}
