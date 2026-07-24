"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { createReportAction } from "@/server/actions/reports";
import { useToast } from "@/lib/toast";
import type { Dictionary } from "@/locales";

interface Props { postId?: string; correctionId?: string; dict: Dictionary; }

export function ReportButton({ postId, correctionId, dict }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { addToast } = useToast();

  if (done) return <span className="text-xs text-success">{dict.report.submitted}</span>;

  const reasons = useMemo(() => [
    { value: "SPAM", label: dict.report.spam }, { value: "HARASSMENT", label: dict.report.harassment },
    { value: "INAPPROPRIATE_CONTENT", label: dict.report.inappropriate }, { value: "OTHER", label: dict.report.other },
  ], [dict]);

  const handleReport = async () => {
    if (!reason) return; setLoading(true); setError(null);
    const fd = new FormData();
    if (postId) fd.append("postId", postId);
    if (correctionId) fd.append("correctionId", correctionId);
    fd.append("reason", reason);
    const result = await createReportAction({}, fd);
    if (result?.errors?._form) setError(result.errors._form[0]);
    else if (result?.success) { setDone(true); setOpen(false); addToast(dict.report.submitted); }
    setLoading(false);
  };

  return (
    <span className="relative">
      <button type="button" className="text-xs text-ink-faint hover:text-error cursor-pointer" onClick={() => setOpen(!open)}>{dict.report.report}</button>
      {open && (
        <div className="absolute top-6 right-0 z-50 bg-base-100 border border-base-300 rounded-box shadow-lg p-3 w-56">
          {error && <Alert variant="error" className="mb-2 text-xs">{error}</Alert>}
          <Select label={dict.report.reason} options={reasons} placeholder={dict.report.selectReason} value={reason} onChange={e => setReason(e.target.value)} />
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>{dict.common.cancel}</Button>
            <Button size="sm" variant="danger" loading={loading} onClick={handleReport} disabled={!reason}>{dict.common.submit}</Button>
          </div>
        </div>
      )}
    </span>
  );
}
