import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getLibraryItems } from "@/server/queries/library";
import { RemoveFromLibraryButton } from "@/components/RemoveFromLibraryButton";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  const dict = await getDict();
  const items = user ? await getLibraryItems(user.id) : [];

  return (
    <AppShell>
      <PageHeader title={dict.library.title} description={dict.library.desc} />

      {items.length === 0 ? (
        <EmptyState icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>} title={dict.library.empty} description={dict.library.emptyDesc} action={{ label: dict.library.emptyAction, href: "/app" }} />
      ) : (
        <div className="space-y-4 pb-8">
          {items.map(item => (
            <Card key={item.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div><p className="text-xs text-base-content/40 mb-1">{dict.library.original}</p><p className="text-sm bg-error/5 border border-error/10 rounded-box p-3 leading-relaxed whitespace-pre-wrap">{item.originalTextSnapshot}</p></div>
                <div><p className="text-xs text-base-content/40 mb-1">{dict.library.corrected}</p><p className="text-sm bg-success/5 border border-success/20 rounded-box p-3 leading-relaxed whitespace-pre-wrap">{item.correctedTextSnapshot || dict.common.placeholder}</p></div>
              </div>
              {item.explanationSnapshot && (
                <div className="mb-3"><p className="text-xs text-base-content/40 mb-1">{dict.library.reason}</p><p className="text-sm text-base-content/70 bg-base-200 rounded-box p-3 leading-relaxed">{item.explanationSnapshot}</p></div>
              )}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {item.toneNoteSnapshot && <Badge variant="default" size="sm">{dict.library.tone}: {item.toneNoteSnapshot}</Badge>}
                <span className="text-xs text-base-content/30">{dict.library.savedAt} {new Date(item.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-base-200">
                {item.post && <Link href={`/posts/${item.post.id}`} className="text-xs text-primary hover:underline">{dict.library.viewPost}</Link>}
                <RemoveFromLibraryButton itemId={item.id} dict={dict} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
