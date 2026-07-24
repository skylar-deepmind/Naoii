"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/Badge";
import { getTemplateData } from "@/lib/templates";
import type { Dictionary, Locale } from "@/locales";

interface Props {
  dict: Dictionary;
  locale: Locale;
  currentContent: string;
  onInsert: (text: string) => void;
}

export function TemplateSelector({ dict, locale, currentContent, onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const templateData = getTemplateData(locale);
  const scenes = dict.templates.scenes;
  const currentTemplate = selectedScene
    ? templateData.find((t) => t.key === selectedScene)
    : null;

  const handleInsertSkeleton = useCallback(() => {
    if (!currentTemplate?.skeleton) return;
    const newContent = currentContent
      ? currentContent + "\n\n" + currentTemplate.skeleton
      : currentTemplate.skeleton;
    onInsert(newContent);
  }, [currentTemplate, currentContent, onInsert]);

  const handleSceneClick = (key: string) => {
    setSelectedScene((prev) => (prev === key ? null : key));
  };

  return (
    <div className="border border-base-200 rounded-box">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-base-200 transition-colors"
      >
        <span className="text-foreground/70">
          {dict.templates.toggleLabel}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-base-200 px-4 py-3">
          {/* Scene chips */}
          <div className="flex flex-wrap gap-1.5">
            {templateData.map((tmpl) => {
              const scene = scenes[tmpl.key];
              if (!scene) return null;
              return (
                <button
                  key={tmpl.key}
                  type="button"
                  onClick={() => handleSceneClick(tmpl.key)}
                  className={`transition-colors ${
                    selectedScene === tmpl.key
                      ? "badge badge-primary badge-sm"
                      : "badge badge-ghost badge-sm hover:badge-neutral"
                  }`}
                >
                  {scene.name}
                </button>
              );
            })}
          </div>

          {/* Selected scene detail */}
          {currentTemplate && selectedScene && (
            <div className="mt-3 p-3 bg-base-200 rounded-box">
              {/* Tips (read-only) */}
              <ul className="space-y-1">
                {currentTemplate.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground/70 flex items-start gap-2"
                  >
                    <span className="text-primary shrink-0 mt-0.5">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>

              {/* Skeleton insert button */}
              {currentTemplate.skeleton && (
                <button
                  type="button"
                  onClick={handleInsertSkeleton}
                  className="btn btn-xs btn-outline mt-3"
                >
                  {dict.templates.insertButton}
                </button>
              )}

              <p className="text-xs text-ink-faint mt-2">
                {dict.templates.noOverwrite}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
