"use client";

import { useRouter } from "next/navigation";
import { localeLabels, type Locale, locales } from "@/locales";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter();

  const switchLanguage = (locale: Locale) => {
    document.cookie = `naoii_lang=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    router.refresh();
  };

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm text-xs gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
        {localeLabels[currentLocale]}
      </label>
      <ul tabIndex={0} className="menu menu-sm dropdown-content mt-1 z-50 p-1 shadow bg-base-100 rounded-box w-32">
        {locales.map((loc) => (
          <li key={loc}>
            <button
              className={currentLocale === loc ? "active" : ""}
              onClick={() => switchLanguage(loc)}
            >
              {localeLabels[loc]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
