import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog" };

interface Section { heading?: string; items: string[] }
interface Version {
  version: string; date: string;
  intro: string;
  sections: Section[];
  notes?: string;
}

export default async function ChangelogPage() {
  const dict = await getDict();
  const intro = dict.changelog.intro as string;
  const versions = dict.changelog.versions as Version[];

  return (
    <AppShell>
      <div className="py-8 sm:py-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{dict.changelog.title}</h1>
        <p className="text-base-content/60 mb-10">{intro}</p>
        <div className="space-y-10">
          {versions.map((v, vi) => (
            <div key={vi}>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="primary" size="sm">{v.version}</Badge>
                <span className="text-sm text-base-content/50">{v.date}</span>
              </div>
              {v.intro && <p className="text-sm text-base-content/70 mb-4">{v.intro}</p>}
              {v.sections.map((s, si) => (
                <div key={si} className="mb-4">
                  {s.heading && <h3 className="text-sm font-semibold mb-2">{s.heading}</h3>}
                  <ul className="space-y-1.5">
                    {s.items.map((item, ii) => (
                      <li key={ii} className="text-sm text-base-content/70 flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {v.notes && <p className="text-sm text-base-content/40 italic mt-4">{v.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
