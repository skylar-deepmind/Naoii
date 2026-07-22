"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  dict: Record<string, string>;
}

export function CreateButton({ dict }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="btn btn-primary btn-sm gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">{dict.recordNow || "记录此刻"}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-base-100 rounded-box shadow-lg border border-base-200 z-50 p-2">
          <Link
            href="/posts/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <div>
              <p className="text-sm font-medium">{dict.momentNew || "发瞬间"}</p>
              <p className="text-xs text-base-content/50">{dict.momentDesc || "快速记录短表达"}</p>
            </div>
          </Link>
          <Link
            href="/articles/new"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-base-200 transition-colors"
            onClick={() => setOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium">{dict.articleNew || "写篇章"}</p>
              <p className="text-xs text-base-content/50">{dict.articleDesc || "长文章、日记、博客"}</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
