"use client";

import Link from "next/link";
import { useState } from "react";

const navItems = [
  {
    key: "home",
    label: "首页",
    href: "/app",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
    ),
  },
  {
    key: "moments",
    label: "瞬间",
    href: "/app/moments",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    key: "create",
    label: "记录",
    href: "#",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    highlight: true,
  },
  {
    key: "notifications",
    label: "通知",
    href: "/notifications",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    key: "me",
    label: "我",
    href: "/settings/profile",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const [createOpen, setCreateOpen] = useState(false);

  // Hide on desktop
  return (
    <nav className="btm-nav btm-nav-sm lg:hidden border-t border-base-200 bg-base-100 z-40">
      {navItems.map((item) => {
        if (item.key === "create") {
          return (
            <div key={item.key} className="relative">
              <button
                type="button"
                onClick={() => setCreateOpen(!createOpen)}
                onBlur={() => setTimeout(() => setCreateOpen(false), 150)}
                className="flex flex-col items-center justify-center w-full h-full text-primary"
              >
                <div className="bg-primary text-primary-content rounded-full p-1.5 -mt-5 shadow-lg">
                  {item.icon}
                </div>
                <span className="btm-nav-label text-xs mt-0.5">{item.label}</span>
              </button>
              {createOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-36 bg-base-100 rounded-box shadow-lg border border-base-200 z-50 p-1">
                  <Link
                    href="/posts/new"
                    onClick={() => setCreateOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    <span>发瞬间</span>
                  </Link>
                  <Link
                    href="/articles/new"
                    onClick={() => setCreateOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-base-200 text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span>写篇章</span>
                  </Link>
                </div>
              )}
            </div>
          );
        }
        return (
          <Link key={item.key} href={item.href} className={item.highlight ? "text-primary" : ""}>
            {item.icon}
            <span className="btm-nav-label text-xs">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
