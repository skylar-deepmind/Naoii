"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteEntryAction, updateEntryAction } from "@/server/actions/entry";

type Props = {
  entryId: string;
  type: "MOMENT" | "ARTICLE";
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  labels: { edit: string; visibility: string; delete: string; deleteConfirm: string; public: string; unlisted: string; private: string };
};

export function EntryManagementActions({ entryId, type, visibility, labels }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function changeVisibility(nextVisibility: string) {
    setBusy(true);
    const data = new FormData();
    data.set("entryId", entryId);
    data.set("visibility", nextVisibility);
    const result = await updateEntryAction({}, data);
    setBusy(false);
    if (!result.errors) router.refresh();
  }

  async function remove() {
    if (!window.confirm(labels.deleteConfirm)) return;
    setBusy(true);
    const data = new FormData();
    data.set("entryId", entryId);
    const result = await deleteEntryAction({}, data);
    setBusy(false);
    if (!result.errors) router.push("/app");
  }

  const editHref = type === "ARTICLE" ? `/articles/${entryId}/edit` : `/posts/${entryId}/edit`;
  return (
    <div className="flex flex-wrap items-center gap-1" onClick={(event) => event.stopPropagation()}>
      <Link href={editHref} className="btn btn-ghost btn-xs">{labels.edit}</Link>
      <select aria-label={labels.visibility} disabled={busy} value={visibility} onChange={(event) => changeVisibility(event.target.value)} className="select select-ghost select-xs max-w-32">
        <option value="PUBLIC">{labels.public}</option>
        <option value="UNLISTED">{labels.unlisted}</option>
        <option value="PRIVATE">{labels.private}</option>
      </select>
      <button type="button" disabled={busy} onClick={remove} className="btn btn-ghost btn-xs text-error">{labels.delete}</button>
    </div>
  );
}
