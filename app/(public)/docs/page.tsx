import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { getDict } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Docs" };

export default async function DocsPage() {
  const dict = await getDict();

  return (
    <AppShell>
      <div className="py-8 sm:py-12 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{dict.docs.title}</h1>
        <p className="text-base-content/60 mb-10">{dict.docs.desc}</p>
        <div className="space-y-8">
          <Card><h2 className="text-xl font-bold mb-3">{dict.docs.whatIs}</h2>
            <div className="text-sm text-base-content/70 leading-relaxed space-y-2">
              <p>{dict.docs.whatIsDesc}</p>
              <ol className="list-decimal pl-5 space-y-1"><li>{dict.docs.step1}</li><li>{dict.docs.step2}</li><li>{dict.docs.step3}</li><li>{dict.docs.step4}</li><li>{dict.docs.step5}</li></ol>
              <p>{dict.docs.whatIsFooter}</p>
            </div></Card>
          <Card><h2 className="text-xl font-bold mb-3">{dict.docs.posting}</h2>
            <div className="text-sm text-base-content/70 leading-relaxed space-y-2">
              <p>{dict.docs.postingDesc}</p>
              <ul className="list-disc pl-5 space-y-1"><li>{dict.docs.postingContent}</li><li>{dict.docs.postingTitle}</li><li>{dict.docs.postingLang}</li><li>{dict.docs.postingType}</li><li>{dict.docs.postingTone}</li><li>{dict.docs.postingVisibility}</li></ul>
            </div></Card>
          <Card><h2 className="text-xl font-bold mb-3">{dict.docs.correctionsTitle}</h2>
            <div className="text-sm text-base-content/70 leading-relaxed space-y-2">
              <p>{dict.docs.correctionsDesc}</p>
              <ul className="list-disc pl-5 space-y-1"><li>{dict.docs.corrText}</li><li>{dict.docs.corrReason}</li><li>{dict.docs.corrTone}</li></ul>
              <p>{dict.docs.corrFooter}</p>
            </div></Card>
          <Card><h2 className="text-xl font-bold mb-3">{dict.docs.acceptanceTitle}</h2>
            <div className="text-sm text-base-content/70 leading-relaxed space-y-2">
              <p>{dict.docs.acceptanceDesc}</p>
              <ul className="list-disc pl-5 space-y-1"><li>{dict.docs.acc1}</li><li>{dict.docs.acc2}</li><li>{dict.docs.acc3}</li><li>{dict.docs.acc4}</li></ul>
              <p>{dict.docs.accFooter}</p>
            </div></Card>
          <Card><h2 className="text-xl font-bold mb-3">{dict.docs.libraryTitle}</h2>
            <div className="text-sm text-base-content/70 leading-relaxed space-y-2"><p>{dict.docs.libraryDesc}</p><p>{dict.docs.libraryFooter}</p></div></Card>
          <Card><h2 className="text-xl font-bold mb-3">{dict.docs.managementTitle}</h2>
            <div className="text-sm text-base-content/70 leading-relaxed"><p>{dict.docs.managementDesc}</p></div></Card>
        </div>
      </div>
    </AppShell>
  );
}
