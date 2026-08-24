"use client";

import { useTheme, type ThemeMode } from "@/lib/theme";

interface ThemeLabels {
  switcherLabel: string;
  system: string;
  light: string;
  dark: string;
}

export function ThemeSwitcher({ labels }: { labels: ThemeLabels }) {
  const { theme, setTheme } = useTheme();
  const options: { key: ThemeMode; label: string; icon: string }[] = [
    { key: "system", label: labels.system, icon: "💻" },
    { key: "light", label: labels.light, icon: "☀️" },
    { key: "dark", label: labels.dark, icon: "🌙" },
  ];

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-sm text-xs gap-1"
        aria-label={labels.switcherLabel}
        title={labels.switcherLabel}
      >
        <span>{options.find((o) => o.key === theme)?.icon || "🎨"}</span>
      </label>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-1 z-50 p-1 shadow bg-base-100 rounded-box w-36"
      >
        {options.map((opt) => (
          <li key={opt.key}>
            <button
              className={theme === opt.key ? "active" : ""}
              onClick={() => setTheme(opt.key)}
            >
              <span>{opt.icon}</span>
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
