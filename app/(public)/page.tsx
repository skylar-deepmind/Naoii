import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getDict } from "@/lib/i18n";

export default async function HomePage() {
  const dict = await getDict();

  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24 lg:py-32">
        <AppShell>
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="primary" size="sm" className="mb-6">{dict.home.badge}</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              {dict.home.heroTitle1}<br /><span className="text-primary">{dict.home.heroTitle2}</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-base-content/60 max-w-2xl mx-auto leading-relaxed">{dict.home.heroDesc}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/register" variant="primary" size="lg">{dict.home.ctaRegister}</Button>
              <Button href="/app" variant="outline" size="lg">{dict.home.ctaBrowse}</Button>
            </div>
          </div>
        </AppShell>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 bg-base-200">
        <AppShell>
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{dict.home.featuresTitle}</h2>
            <p className="mt-3 text-base-content/60 max-w-xl mx-auto">{dict.home.featuresDesc}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: dict.home.feature1Title, desc: dict.home.feature1Desc, icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
              { title: dict.home.feature2Title, desc: dict.home.feature2Desc, icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: dict.home.feature3Title, desc: dict.home.feature3Desc, icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              { title: dict.home.feature4Title, desc: dict.home.feature4Desc, icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" },
            ].map((f) => (
              <Card key={f.title} hover>
                <div className="text-primary mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                </div>
                <h3 className="font-semibold text-base">{f.title}</h3>
                <p className="text-sm text-base-content/60 mt-1.5 leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </AppShell>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <AppShell>
          <div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{dict.home.stepsTitle}</h2></div>
          <div className="max-w-2xl mx-auto">
            <ul className="steps steps-vertical w-full">
              {[
                { title: dict.home.step1Title, desc: dict.home.step1Desc },
                { title: dict.home.step2Title, desc: dict.home.step2Desc },
                { title: dict.home.step3Title, desc: dict.home.step3Desc },
                { title: dict.home.step4Title, desc: dict.home.step4Desc },
              ].map((s, i) => (
                <li key={i} className="step step-primary py-3">
                  <div className="ml-2">
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-sm text-base-content/60 mt-0.5">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </AppShell>
      </section>

      {/* Correction Demo */}
      <section id="demo" className="py-16 sm:py-24 bg-base-200">
        <AppShell>
          <div className="text-center mb-12"><h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{dict.home.demoTitle}</h2><p className="mt-3 text-base-content/60 max-w-xl mx-auto">{dict.home.demoDesc}</p></div>
          <div className="max-w-2xl mx-auto space-y-4">
            <Card>
              <div className="flex items-center gap-2 mb-2"><Badge variant="error" size="sm">{dict.home.demoOriginal}</Badge><span className="text-xs text-base-content/50">{dict.home.demoOriginalLabel}</span></div>
              <p className="text-base leading-relaxed">{dict.home.demoOriginalText}</p>
            </Card>
            <div className="flex justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg></div>
            <Card>
              <div className="flex items-center gap-2 mb-2"><Badge variant="success" size="sm">{dict.home.demoCorrected}</Badge><span className="text-xs text-base-content/50">{dict.home.demoCorrectedLabel}</span></div>
              <p className="text-base leading-relaxed text-success font-medium">{dict.home.demoCorrectedText}</p>
              <div className="mt-3 bg-base-200 rounded-box p-3"><p className="text-xs text-base-content/50 mb-1">{dict.home.demoReason}</p><p className="text-sm text-base-content/70">{dict.home.demoReasonText}</p></div>
            </Card>
          </div>
        </AppShell>
      </section>

      {/* Reputation */}
      <section id="reputation" className="py-16 sm:py-24">
        <AppShell>
          <div className="max-w-2xl mx-auto"><h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">{dict.home.repTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
              <Card><p className="text-3xl font-bold text-primary">{dict.home.rep1Title}</p><p className="text-sm text-base-content/60 mt-2">{dict.home.rep1Desc}</p></Card>
              <Card><p className="text-3xl font-bold text-primary">{dict.home.rep2Title}</p><p className="text-sm text-base-content/60 mt-2">{dict.home.rep2Desc}</p></Card>
              <Card><p className="text-3xl font-bold text-primary">{dict.home.rep3Title}</p><p className="text-sm text-base-content/60 mt-2">{dict.home.rep3Desc}</p></Card>
            </div>
          </div>
        </AppShell>
      </section>

      {/* Library */}
      <section id="library" className="py-16 sm:py-24 bg-base-200">
        <AppShell><div className="max-w-2xl mx-auto text-center"><h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{dict.home.libTitle}</h2><p className="mt-4 text-base-content/60">{dict.home.libDesc}</p></div></AppShell>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-primary text-primary-content">
        <AppShell><div className="text-center max-w-2xl mx-auto"><h2 className="text-3xl sm:text-4xl font-bold tracking-tight">{dict.home.ctaTitle}</h2><p className="mt-4 text-lg opacity-90 leading-relaxed">{dict.home.ctaDesc}</p><Button href="/register" variant="primary" size="lg" className="mt-8 bg-base-100 text-primary border-none hover:bg-base-200">{dict.home.ctaButton}</Button></div></AppShell>
      </section>
    </div>
  );
}
