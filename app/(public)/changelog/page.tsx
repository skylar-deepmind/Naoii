import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog" };

export default async function ChangelogPage() {
  const dict = await getDict();

  return (
    <AppShell>
      <div className="py-8 sm:py-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{dict.changelog.title}</h1>
        <p className="text-base-content/60 mb-10">{dict.changelog.desc}</p>
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="primary" size="sm">{dict.changelog.version}</Badge>
              <span className="text-sm text-base-content/50">{dict.changelog.date}</span>
            </div>
            <ul className="space-y-1.5">
              {dict.changelog.changes.map((change, i) => (
                <li key={i} className="text-sm text-base-content/70 flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">•</span>{change}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="mt-10 text-center text-sm text-base-content/40"><p>{dict.changelog.comingSoon}</p></div>
      </div>
    </AppShell>
  );
}
