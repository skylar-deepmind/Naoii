import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WelcomeToast } from "@/components/WelcomeToast";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";

export default async function AppDashboardPage() {
  const user = await getCurrentUser();
  const dict = await getDict();

  return (
    <AppShell>
      {/* {user && (
        <WelcomeToast message={`${dict.feed.welcome}，${user.displayName || user.username}！`} />
      )} */}

      <section className="py-12 sm:py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center mb-8">
          {dict.entry.title}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {/* Correct others → /feed */}
          <Link href="/feed">
            <Card hover padding="lg" className="h-full">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">{dict.entry.correctOthers}</h2>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  {dict.entry.correctOthersDesc}
                </p>
                <Button variant="primary" size="sm" className="mt-1">
                  {dict.entry.correctOthersAction}
                </Button>
              </div>
            </Card>
          </Link>

          {/* Ask question → /posts/new?intent=ask */}
          <Link href="/posts/new?intent=ask">
            <Card hover padding="lg" className="h-full">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">{dict.entry.askQuestion}</h2>
                <p className="text-sm text-base-content/60 leading-relaxed">
                  {dict.entry.askQuestionDesc}
                </p>
                <Button variant="secondary" size="sm" className="mt-1">
                  {dict.entry.askQuestionAction}
                </Button>
              </div>
            </Card>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
