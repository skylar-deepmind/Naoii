"use client";

interface FunnelData {
  posts: number;
  corrected: number;
  accepted: number;
  saved: number;
}

export function FunnelChart({ data }: { data: FunnelData }) {
  const steps = [
    { label: "发布表达", value: data.posts, color: "#4f46e5", width: "100%" as const },
    { label: "获得修改", value: data.corrected, color: "#0ea5e9", width: "76%" as const },
    { label: "采纳修改", value: data.accepted, color: "#22c55e", width: "52%" as const },
    { label: "收藏表达", value: data.saved, color: "#f59e0b", width: "28%" as const },
  ];

  const maxVal = Math.max(data.posts, 1);

  return (
    <div className="flex flex-col items-center gap-2">
      {steps.map((s, i) => (
        <div key={s.label} className="w-full max-w-md flex flex-col items-center">
          <div
            className="text-center py-2 rounded-box text-white text-sm font-medium"
            style={{ backgroundColor: s.color, width: s.width, minWidth: "80px" }}
          >
            {s.label}
          </div>
          <div className="text-xs text-ink-muted mt-1">{s.value}</div>
          {i < steps.length - 1 && (
            <div className="text-base-content/20 text-lg my-1">↓</div>
          )}
        </div>
      ))}
    </div>
  );
}
