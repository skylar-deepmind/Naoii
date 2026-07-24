"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  overview: string;
  analytics: string;
  topics: string;
}

const tabDefs = [
  { key: "dashboard", href: "/admin" },
  { key: "analytics", href: "/admin/analytics" },
  { key: "topics", href: "/admin/topics" },
] as const;

export function AdminNav({ overview, analytics, topics }: Props) {
  const pathname = usePathname();

  const labels: Record<string, string> = {
    dashboard: overview,
    analytics,
    topics,
  };

  return (
    <div className="tabs tabs-box mb-6">
      {tabDefs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`tab tab-sm ${pathname === tab.href || (tab.href !== "/admin" && pathname.startsWith(tab.href)) ? "tab-active" : ""}`}
        >
          {labels[tab.key]}
        </Link>
      ))}
    </div>
  );
}
