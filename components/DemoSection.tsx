"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Dictionary } from "@/locales";

type ExampleLang = "zh" | "en" | "ja";

const exampleLangs: { key: ExampleLang; label: string }[] = [
  { key: "zh", label: "中文" },
  { key: "en", label: "English" },
  { key: "ja", label: "日本語" },
];

const reasonLangLabels: Record<string, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

interface Props {
  dict: Dictionary;
}

export function DemoSection({ dict }: Props) {
  const [activeExample, setActiveExample] = useState<ExampleLang>("zh");
  const [reasonLang, setReasonLang] = useState<string>("zh");

  const examples = dict.home.demoExamples;
  if (!examples) return null;

  const current = examples[activeExample];
  if (!current) return null;

  const reasonText = current.reasons[reasonLang] || current.reasons.zh || "";

  return (
    <div>
      {/* Example language tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {exampleLangs.map((l) => (
          <button
            key={l.key}
            type="button"
            onClick={() => setActiveExample(l.key)}
            className={`btn btn-sm ${
              activeExample === l.key ? "btn-primary" : "btn-ghost"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Original */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="error" size="sm">{dict.home.demoOriginal}</Badge>
            {/* <span className="text-xs text-ink-muted">{dict.home.demoOriginalLabel}</span> */}
          </div>
          <p className="text-base leading-relaxed">{current.original}</p>
        </Card>

        {/* Arrow */}
        <div className="flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Corrected */}
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success" size="sm">{dict.home.demoCorrected}</Badge>
            {/* <span className="text-xs text-ink-muted">{dict.home.demoCorrectedLabel}</span> */}
          </div>
          <p className="text-base leading-relaxed text-success font-medium">
            {current.corrected}
          </p>

          {/* Explanation with language toggle */}
          <div className="mt-3 bg-base-200 rounded-box p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-ink-muted">{dict.home.demoReason}</p>
              {dict.home.demoReasonLang && (
                <div className="flex items-center gap-1">
                  {/* <span className="text-xs text-ink-faint">{dict.home.demoReasonLang}:</span> */}
                  <div className="join join-horizontal">
                    {(["zh", "en", "ja"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setReasonLang(l)}
                        className={`join-item btn btn-xs ${
                          reasonLang === l ? "btn-active" : ""
                        }`}
                      >
                        {reasonLangLabels[l]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {reasonText}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
