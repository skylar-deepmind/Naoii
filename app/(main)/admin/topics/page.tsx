import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AdminNav } from "@/components/AdminNav";
import { getTopicsForAdmin, getTopicStatus } from "@/server/queries/topic";
import { closeTopicAction, reopenTopicAction } from "@/server/actions/topic";

export default async function AdminTopicsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const dict = await getDict();
  const adminT = dict.admin?.topics || {};
  const topics = await getTopicsForAdmin();

  const AdminBtn = ({
    action,
    children,
    variant = "ghost",
    name,
    value,
  }: {
    action: any;
    children: React.ReactNode;
    variant?: "ghost" | "danger" | "success" | "primary";
    name: string;
    value: string;
  }) => (
    <form action={action} className="inline">
      <input type="hidden" name={name} value={value} />
      <Button type="submit" variant={variant} size="sm">
        {children}
      </Button>
    </form>
  );

  return (
    <AppShell>
      <PageHeader
        title={adminT.title || "话题管理"}
        description={adminT.desc || "创建和管理话题与限时活动"}
        action={
          <Link href="/admin/topics/new">
            <Button variant="primary" size="sm">{adminT.create || "新建话题"}</Button>
          </Link>
        }
      />
      <AdminNav
        overview={dict.admin?.overview || "概览"}
        analytics={dict.admin?.analytics || "数据看板"}
        topics={adminT.title || "话题管理"}
      />

      {topics.length === 0 ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          title="暂无话题"
        />
      ) : (
        <div className="space-y-3">
          {topics.map((topic) => {
            const status = getTopicStatus(topic);
            const isClosed = status === "CLOSED";
            return (
              <Card key={topic.id} padding="sm">
                <div className="flex items-center gap-3">
                  {topic.coverImage && (
                    <div className="w-12 h-12 shrink-0 rounded-box overflow-hidden">
                      <img src={topic.coverImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{topic.name}</span>
                      {topic.isPermanent ? (
                        <Badge variant="default" size="sm">{dict.topics?.permanent || "常驻"}</Badge>
                      ) : (
                        <Badge variant="default" size="sm">{dict.topics?.event || "活动"}</Badge>
                      )}
                      <Badge variant={isClosed ? "error" : "success"} size="sm">
                        {dict.topics?.status?.[status.toLowerCase()] || status}
                      </Badge>
                    </div>
                    <div className="text-xs text-ink-muted mt-0.5">
                      /{topic.slug} · {new Date(topic.createdAt).toLocaleDateString("zh-CN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/admin/topics/${topic.id}/edit`}>
                      <Button variant="ghost" size="sm">{dict.common?.edit || "编辑"}</Button>
                    </Link>
                    {isClosed ? (
                      <AdminBtn action={reopenTopicAction} variant="success" name="topicId" value={topic.id}>
                        {adminT.reopen || "重新开启"}
                      </AdminBtn>
                    ) : (
                      <AdminBtn action={closeTopicAction} variant="danger" name="topicId" value={topic.id}>
                        {adminT.close || "关闭"}
                      </AdminBtn>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
