import { AppShell } from "@/components/ui/AppShell";
import type { Dictionary } from "@/locales";

interface LegalPageProps {
  title: string;
  lead: string;
  sections: Dictionary["legal"]["termsSections"];
}

export function LegalPage({ title, lead, sections }: LegalPageProps) {
  return (
    <AppShell>
      <article className="max-w-3xl mx-auto py-10 sm:py-16">
        <h1 className="text-heading-1 font-bold">{title}</h1>
        <p className="mt-4 text-ink-muted">{lead}</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-ink-muted leading-7">
                {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </article>
    </AppShell>
  );
}
