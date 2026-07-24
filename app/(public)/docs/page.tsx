import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Docs" };

export default async function DocsPage() {
  const dict = await getDict();
  const sections = dict.docs.sections as { heading: string; body: string[] }[];

  return (
    <AppShell>
      <div className="py-8 sm:py-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{dict.docs.title}</h1>
        <p className="text-ink-muted mb-10">{dict.docs.desc}</p>
        <div className="space-y-8">
          {sections.map((s, i) => (
            <Card key={i}>
              <h2 className="text-xl font-bold mb-3">{s.heading}</h2>
              <div className="text-sm text-foreground/70 leading-relaxed space-y-2">
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
