"use client";

import { useRouter } from "next/navigation";

const ranges = [
  { key: "today", label: "今天" },
  { key: "7d", label: "最近 7 天" },
  { key: "30d", label: "最近 30 天" },
] as const;

export function TimeRangeTabs({ current }: { current: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2 mb-6">
      {ranges.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => router.push(`/admin/analytics?range=${r.key}`)}
          className={`btn btn-sm ${current === r.key ? "btn-primary" : "btn-ghost"}`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
