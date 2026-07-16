"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type TrendData = { date: string; count: number }[];

const metrics = [
  { key: "users", label: "新增用户", color: "#4f46e5" },
  { key: "posts", label: "发布表达", color: "#0ea5e9" },
  { key: "corrections", label: "新增修改", color: "#22c55e" },
  { key: "closed", label: "有效闭环", color: "#f59e0b" },
];

interface Props {
  users: TrendData;
  posts: TrendData;
  corrections: TrendData;
  closed: TrendData;
}

export function TrendChart({ users, posts, corrections, closed }: Props) {
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(
    new Set(["users", "posts", "corrections"])
  );

  const toggle = (key: string) => {
    const next = new Set(activeMetrics);
    if (next.has(key)) next.delete(key); else next.add(key);
    setActiveMetrics(next);
  };

  // Merge all data by date
  const dateMap = new Map<string, any>();
  for (const d of users) dateMap.set(d.date, { ...dateMap.get(d.date), date: d.date.slice(5), users: d.count });
  for (const d of posts) dateMap.set(d.date, { ...dateMap.get(d.date), posts: d.count });
  for (const d of corrections) dateMap.set(d.date, { ...dateMap.get(d.date), corrections: d.count });
  for (const d of closed) dateMap.set(d.date, { ...dateMap.get(d.date), closed: d.count });
  const data = Array.from(dateMap.values());

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {metrics.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => toggle(m.key)}
            className={`badge badge-sm cursor-pointer ${
              activeMetrics.has(m.key) ? "text-white" : "badge-ghost"
            }`}
            style={activeMetrics.has(m.key) ? { backgroundColor: m.color, borderColor: m.color } : {}}
          >
            {m.label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          {activeMetrics.has("users") && <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} dot={false} name="新增用户" />}
          {activeMetrics.has("posts") && <Line type="monotone" dataKey="posts" stroke="#0ea5e9" strokeWidth={2} dot={false} name="发布表达" />}
          {activeMetrics.has("corrections") && <Line type="monotone" dataKey="corrections" stroke="#22c55e" strokeWidth={2} dot={false} name="新增修改" />}
          {activeMetrics.has("closed") && <Line type="monotone" dataKey="closed" stroke="#f59e0b" strokeWidth={2} dot={false} name="有效闭环" />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
