import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostWizard } from "@/components/PostWizard";
import { getCurrentUser } from "@/lib/auth";
import { getDict, getLocale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getLanguages } from "@/server/queries/user";

interface Props { params: Promise<{ id: string }>; }

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const [user, dict, locale, languages] = await Promise.all([getCurrentUser(), getDict(), getLocale(), getLanguages()]);
  if (!user) redirect("/login");
  const entry = await prisma.entry.findUnique({ where: { id }, select: { id: true, type: true, authorId: true, title: true, content: true, sourceLanguageId: true, targetLanguageId: true, expressionType: true, tone: true, completeness: true, visibility: true, topicId: true } });
  if (!entry || entry.type !== "MOMENT" || entry.authorId !== user.id) notFound();
  return <AppShell><PageHeader title={dict.common.edit || "编辑"} description={dict.post.newDesc} /><div className="max-w-2xl pb-8"><PostWizard languages={languages} dict={dict} locale={locale} intent={null} userId={user.id} editEntry={entry} /></div></AppShell>;
}
