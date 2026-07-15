"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Dictionary } from "@/locales";

export function FeedTabs({ dict }: { dict: Dictionary }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "latest";
  const currentCompleteness = searchParams.get("completeness") || "";

  const tabs = [
    { key: "latest", label: dict.feed.tabLatest },
    { key: "awaiting", label: dict.feed.tabAwaiting },
    { key: "has_corrections", label: dict.feed.tabHasCorrections },
    { key: "adopted", label: dict.feed.tabAdopted },
  ] as const;

  const completenessTabs = [
    { key: "", label: dict.completeness.all },
    { key: "COMPLETE", label: dict.completeness.complete },
    { key: "PARTIAL", label: dict.completeness.partial },
    { key: "IDEA_ONLY", label: dict.completeness.ideaOnly },
  ] as const;

  const navigate = (tab: string, completeness: string) => {
    const params = new URLSearchParams();
    if (tab) params.set("tab", tab);
    if (completeness) params.set("completeness", completeness);
    router.push(`/feed?${params.toString()}`);
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Status tabs */}
      <div className="tabs tabs-bordered">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab tab-sm sm:tab-md ${currentTab === tab.key ? "tab-active" : ""}`}
            onClick={() => navigate(tab.key, currentCompleteness)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Completeness filter */}
      <div className="flex gap-1 flex-wrap">
        {completenessTabs.map((ct) => (
          <button
            key={ct.key}
            className={`btn btn-xs ${currentCompleteness === ct.key ? "btn-primary" : "btn-ghost"}`}
            onClick={() => navigate(currentTab, ct.key)}
          >
            {ct.label}
          </button>
        ))}
      </div>
    </div>
  );
}
