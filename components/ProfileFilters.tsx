"use client";

import Link from "next/link";

function buildUrl(username: string, type?: string, year?: number, month?: number, cursor?: string): string {
  const params = new URLSearchParams();
  if (type && type !== "all") params.set("type", type);
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  if (cursor) params.set("cursor", cursor);
  const qs = params.toString();
  return `/profile/${username}${qs ? `?${qs}` : ""}`;
}

export function ProfileFilters({
  username,
  currentType,
  currentYear,
  currentMonth,
  years,
  months,
  isOwner,
  labels,
}: {
  username: string;
  currentType: string;
  currentYear?: number;
  currentMonth?: number;
  years: number[];
  months: string[];
  isOwner: boolean;
  labels: {
    all: string;
    moment: string;
    article: string;
    draft: string;
    allYears: string;
    allMonths: string;
  };
}) {
  const types = ["all", "moment", "article"];
  if (isOwner) types.push("draft");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-base-200 rounded-box p-1">
        {types.map((t) => (
          <Link
            key={t}
            href={buildUrl(username, t, currentYear, currentMonth)}
            className={`px-3 py-1 rounded-btn text-xs font-medium transition-colors ${currentType === t ? "bg-base-100 shadow-sm text-primary" : "text-ink-muted hover:text-base-content"}`}
          >
            {labels[t as keyof typeof labels] || t}
          </Link>
        ))}
      </div>

      {years.length > 0 && (
        <select
          className="select select-bordered select-xs rounded-box"
          value={currentYear ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            window.location.href = v === ""
              ? buildUrl(username, currentType, undefined, undefined)
              : buildUrl(username, currentType, parseInt(v), currentMonth);
          }}
        >
          <option value="">{labels.allYears}</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      )}

      {currentYear && (
        <select
          className="select select-bordered select-xs rounded-box"
          value={currentMonth ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            window.location.href = v === ""
              ? buildUrl(username, currentType, currentYear, undefined)
              : buildUrl(username, currentType, currentYear, parseInt(v));
          }}
        >
          <option value="">{labels.allMonths}</option>
          {months.map((label, i) => (
            <option key={i + 1} value={i + 1}>{label}</option>
          ))}
        </select>
      )}
    </div>
  );
}
