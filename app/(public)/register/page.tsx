import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { RegisterForm } from "@/components/RegisterForm";
import { getLanguages } from "@/server/queries/user";
import { getDict } from "@/lib/i18n";

export default async function RegisterPage() {
  const languages = await getLanguages();
  const dict = await getDict();

  return (
    <AppShell>
      <div className="min-h-[60vh] flex items-center justify-center py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{dict.auth.registerTitle}</h1>
            <p className="mt-2 text-sm text-base-content/60">{dict.auth.registerDesc}</p>
          </div>
          <Card><RegisterForm languages={languages} dict={dict} /></Card>
          <p className="text-center text-sm text-base-content/60 mt-6">
            {dict.auth.hasAccount}{" "}
            <Link href="/login" className="link link-primary font-medium">{dict.auth.goLogin}</Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
