import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminNav } from "@/components/AdminNav";
import { TopicForm } from "@/components/TopicForm";
import { createTopicAction } from "@/server/actions/topic";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";

export default async function AdminNewTopicPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const dict = await getDict();

  return (
    <AppShell>
      <PageHeader
        title={dict.admin?.topics?.create || "新建话题"}
        description={dict.admin?.topics?.desc || ""}
      />
      <AdminNav
        overview={dict.admin?.overview || "概览"}
        analytics={dict.admin?.analytics || "数据看板"}
        topics={dict.admin?.topics?.title || "话题管理"}
      />
      <TopicForm action={createTopicAction} dict={dict} />
    </AppShell>
  );
}
