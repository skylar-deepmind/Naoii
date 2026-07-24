"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface SidebarSection {
  key: string;
  items: SidebarItem[];
}

interface SidebarItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  disabled?: boolean;
  disabledTooltip?: string;
}

interface Props {
  sections: SidebarSection[];
  dict: Record<string, any>;
}

export function Sidebar({ sections, dict }: Props) {
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-base-300 bg-surface sticky top-16 h-[calc(100vh-4rem)]">
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {sections.map((section, si) => (
          <div key={section.key}>
            {si > 0 && <div className="divider my-2" />}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));
                return (
                  <li key={item.key}>
                    {item.disabled ? (
                      <span
                          className="flex items-center gap-3 px-3 py-2 rounded-[5px] text-sm text-ink-faint cursor-not-allowed"
                        title={item.disabledTooltip || ""}
                      >
                        <span className="w-5 h-5 flex items-center justify-center opacity-40">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                      </span>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-[5px] text-sm transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-primary pl-[9px]"
                            : "hover:bg-black/[0.04] text-foreground/70 border-l-[3px] border-transparent pl-[9px]"
                        }`}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge != null && item.badge > 0 && (
                          <span className="badge badge-xs badge-primary">{item.badge > 99 ? "99+" : item.badge}</span>
                        )}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Create FAB */}
      <div className="relative px-3 pb-4">
        <button
          type="button"
          onClick={() => setCreateOpen(!createOpen)}
          onBlur={() => setTimeout(() => setCreateOpen(false), 150)}
          className="btn btn-primary w-full gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {dict.recordNow || "记录此刻"}
        </button>
        {createOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface rounded-box shadow-level-1 border border-base-300 z-50 p-1">
            <Link
              href="/posts/new"
              onClick={() => setCreateOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{dict.momentNew || "发瞬间"}</span>
            </Link>
            <Link
              href="/articles/new"
              onClick={() => setCreateOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{dict.articleNew || "写篇章"}</span>
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
