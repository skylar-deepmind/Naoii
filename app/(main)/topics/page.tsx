import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { TopicCard } from "@/components/TopicCard";
import { getActiveTopics } from "@/server/queries/topic";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import Link from "next/link";

export default async function TopicsPage() {
  const dict = await getDict();
  const topics = await getActiveTopics();
  const user = await getCurrentUser();

  return (
    <AppShell>
      <PageHeader
        title={dict.topics?.title || "话题"}
        description={dict.topics?.desc || "浏览话题和限时活动"}
        action={
          user?.role === "ADMIN" ? (
            <Link href="/admin/topics">
              <Button variant="ghost" size="sm">{dict.admin?.topics?.title || "话题管理"}</Button>
            </Link>
          ) : undefined
        }
      />

      {topics.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          title={dict.topics?.empty || "暂无话题"}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} dict={dict} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
