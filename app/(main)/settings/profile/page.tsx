import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProfileForm } from "@/components/ProfileForm";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getLanguages } from "@/server/queries/user";
import { prisma } from "@/lib/prisma";

export default async function SettingsProfilePage() {
  const currentUser = await getCurrentUser();
  const dict = await getDict();
  const userWithProfile = await prisma.user.findUnique({ where: { id: currentUser!.id }, include: { profile: true } });
  const profile = userWithProfile?.profile;
  const languages = await getLanguages();

  return (
    <AppShell>
      <PageHeader title={dict.settings.title} description={dict.settings.desc} action={
        <Link href={`/profile/${currentUser!.username}`} className="btn btn-outline btn-sm">{dict.profile.viewProfile}</Link>
      } />
      <div className="max-w-lg">
        <Card>
          <ProfileForm user={currentUser!} profile={{ displayName: profile?.displayName ?? null, bio: profile?.bio ?? null, nativeLanguageId: profile?.nativeLanguageId ?? null, learningLanguageId: profile?.learningLanguageId ?? null, level: profile?.level ?? null, avatarUrl: profile?.avatarUrl ?? null }} languages={languages} dict={dict} />
        </Card>
      </div>
    </AppShell>
  );
}
