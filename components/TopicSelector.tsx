"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/locales";

async function fetchTopics(): Promise<{ id: string; name: string }[]> {
  try {
    const res = await fetch("/api/topics/active");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

interface Props {
  value?: string;
  onChange: (topicId: string) => void;
  dict: Dictionary;
}

export function TopicSelector({ value, onChange, dict }: Props) {
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  if (topics.length === 0) return null;

  return (
    <div>
      <label className="label text-sm font-medium">{dict.topics?.fromTopic || "来自话题"}</label>
      <select
        className="select select-bordered select-sm w-full"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— {dict.common?.none || "无"} —</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
