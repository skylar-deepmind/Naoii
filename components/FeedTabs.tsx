"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Dictionary } from "@/locales";

export function FeedTabs({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "latest";

  const tabs = [
    { key: "latest", label: dict.feed.tabLatest },
    { key: "awaiting", label: dict.feed.tabAwaiting },
    { key: "has_corrections", label: dict.feed.tabHasCorrections },
    { key: "adopted", label: dict.feed.tabAdopted },
  ] as const;

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`/app?${params.toString()}`);
  };

  return (
    <div className="tabs tabs-bordered mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab tab-sm sm:tab-md ${currentTab === tab.key ? "tab-active" : ""}`}
          onClick={() => handleTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
