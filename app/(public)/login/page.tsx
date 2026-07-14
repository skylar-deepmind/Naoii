import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { LoginForm } from "@/components/LoginForm";
import { getDict } from "@/lib/i18n";

export default async function LoginPage() {
  const dict = await getDict();

  return (
    <AppShell>
      <div className="min-h-[60vh] flex items-center justify-center py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">{dict.auth.loginTitle}</h1>
            <p className="mt-2 text-sm text-base-content/60">{dict.auth.loginDesc}</p>
          </div>
          <Card><LoginForm dict={dict} /></Card>
          <p className="text-center text-sm text-base-content/60 mt-6">
            {dict.auth.noAccount}{" "}
            <Link href="/register" className="link link-primary font-medium">{dict.auth.goRegister}</Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
