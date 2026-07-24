import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminNav } from "@/components/AdminNav";
import { TopicForm } from "@/components/TopicForm";
import { updateTopicAction } from "@/server/actions/topic";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditTopicPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const { id } = await params;
  const dict = await getDict();

  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) notFound();

  const initialData = {
    id: topic.id,
    name: topic.name,
    slug: topic.slug,
    description: topic.description,
    coverImage: topic.coverImage,
    isPermanent: topic.isPermanent,
    startTime: topic.startTime?.toISOString().slice(0, 16) ?? null,
    endTime: topic.endTime?.toISOString().slice(0, 16) ?? null,
    eventDescription: topic.eventDescription,
  };

  return (
    <AppShell>
      <PageHeader
        title={dict.admin?.topics?.edit || "编辑话题"}
        description={dict.admin?.topics?.desc || ""}
      />
      <AdminNav
        overview={dict.admin?.overview || "概览"}
        analytics={dict.admin?.analytics || "数据看板"}
        topics={dict.admin?.topics?.title || "话题管理"}
      />
      <TopicForm action={updateTopicAction} initialData={initialData} dict={dict} />
    </AppShell>
  );
}
