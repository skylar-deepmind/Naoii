"use client";

import { useTheme, type ThemeMode } from "@/lib/theme";

const options: { key: ThemeMode; label: string; icon: string }[] = [
  { key: "system", label: "跟随系统", icon: "💻" },
  { key: "light", label: "浅色", icon: "☀️" },
  { key: "dark", label: "深色", icon: "🌙" },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-sm text-xs gap-1"
        aria-label="切换主题"
        title="切换主题"
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
