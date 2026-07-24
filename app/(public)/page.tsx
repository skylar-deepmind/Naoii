import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DemoSection } from "@/components/DemoSection";
import { getDict } from "@/lib/i18n";

export default async function HomePage() {
  const dict = await getDict();

  return (
    <div>
      {/* Hero — deep indigo "night" band */}
      <section className="py-16 sm:py-24 lg:py-32 bg-secondary text-secondary-content">
        <AppShell>
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block bg-surface/15 text-white rounded-full px-3 py-1 text-xs font-semibold tracking-[0.125px] mb-6">{dict.home.badge}</span>
            <h1 className="text-display-2 lg:text-display-1">
              {dict.home.heroTitle1}<br /><span className="text-info">{dict.home.heroTitle2}</span>
            </h1>
            <p className="mt-6 text-body-md text-white/70 max-w-2xl mx-auto">{dict.home.heroDesc}</p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Button href="/register" variant="primary" size="lg">{dict.home.ctaRegister}</Button>
              <Link href="/app" className="btn rounded-full font-medium bg-white/90 text-ink hover:bg-white shadow-level-1 btn-lg">{dict.home.ctaBrowse}</Link>
            </div>
          </div>
        </AppShell>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 bg-base-200">
        <AppShell>
          <div className="text-center mb-12">
            <h2 className="text-heading-2 lg:text-heading-1 font-bold">{dict.home.featuresTitle}</h2>
            <p className="mt-3 text-ink-muted max-w-xl mx-auto">{dict.home.featuresDesc}</p>
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
                <p className="text-body-sm text-ink-muted mt-1.5">{f.desc}</p>
              </Card>
            ))}
          </div>
        </AppShell>
      </section>

      {/* Steps */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <AppShell>
          <div className="text-center mb-12"><h2 className="text-heading-2 lg:text-heading-1 font-bold">{dict.home.stepsTitle}</h2></div>
          <div className="max-w-2xl mx-auto">
            <ul className="steps steps-vertical w-full">
  {[
    { title: dict.home.step1Title, desc: dict.home.step1Desc },
    { title: dict.home.step2Title, desc: dict.home.step2Desc },
    { title: dict.home.step3Title, desc: dict.home.step3Desc },
    { title: dict.home.step4Title, desc: dict.home.step4Desc },
  ].map((s, i) => (
    <li key={i} className="step step-primary py-3">
      <div className="w-full min-w-0 text-left">
        <p className="font-semibold leading-6">{s.title}</p>
        <p className="mt-0.5 text-body-sm text-ink-muted">
          {s.desc}
        </p>
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
          <div className="text-center mb-12">
            <h2 className="text-heading-2 lg:text-heading-1 font-bold">{dict.home.demoTitle}</h2>
            <p className="mt-3 text-ink-muted max-w-xl mx-auto">{dict.home.demoDesc}</p>
          </div>
          <DemoSection dict={dict} />
        </AppShell>
      </section>

      {/* Reputation */}
      <section id="reputation" className="py-16 sm:py-24">
        <AppShell>
          <div className="max-w-2xl mx-auto"><h2 className="text-heading-2 lg:text-heading-1 font-bold text-center mb-12">{dict.home.repTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-center">
              <Card><p className="text-heading-3 font-bold text-primary">{dict.home.rep1Title}</p><p className="text-body-sm text-ink-muted mt-2">{dict.home.rep1Desc}</p></Card>
              <Card><p className="text-heading-3 font-bold text-primary">{dict.home.rep2Title}</p><p className="text-body-sm text-ink-muted mt-2">{dict.home.rep2Desc}</p></Card>
              <Card><p className="text-heading-3 font-bold text-primary">{dict.home.rep3Title}</p><p className="text-body-sm text-ink-muted mt-2">{dict.home.rep3Desc}</p></Card>
            </div>
          </div>
        </AppShell>
      </section>

      {/* Library */}
      <section id="library" className="py-16 sm:py-24 bg-base-200">
        <AppShell><div className="max-w-2xl mx-auto text-center"><h2 className="text-heading-2 lg:text-heading-1 font-bold">{dict.home.libTitle}</h2><p className="mt-4 text-ink-muted">{dict.home.libDesc}</p></div></AppShell>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-primary text-primary-content">
        <AppShell><div className="text-center max-w-2xl mx-auto"><h2 className="text-heading-2 lg:text-heading-1 font-bold">{dict.home.ctaTitle}</h2><p className="mt-4 text-body-md opacity-90">{dict.home.ctaDesc}</p><Button href="/register" variant="primary" size="lg" className="mt-8 bg-surface text-primary hover:bg-base-200">{dict.home.ctaButton}</Button></div></AppShell>
      </section>
    </div>
  );
}
