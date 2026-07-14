import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import {
  getPendingReports,
  getAllUsers,
  getAllPosts,
  getAllCorrections,
  getAdminLogs,
} from "@/server/queries/admin";
import {
  resolveReportAction,
  dismissReportAction,
  hidePostAction,
  restorePostAction,
  hideCorrectionAction,
  restoreCorrectionAction,
  banUserAction,
  unbanUserAction,
} from "@/server/actions/admin";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const [reports, users, posts, corrections, logs] = await Promise.all([
    getPendingReports(),
    getAllUsers(),
    getAllPosts(),
    getAllCorrections(),
    getAdminLogs(),
  ]);

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
      <PageHeader title="管理员后台" description="举报 / 用户 / 帖子 / 修改建议 管理" />

      <div className="space-y-10 pb-8">
        {/* Reports */}
        <section>
          <h2 className="text-xl font-bold mb-3">待处理举报 ({reports.length})</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-base-content/50">暂无待处理举报</p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <Card key={r.id} padding="sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    <span>举报者: @{r.reporter.username}</span>
                    <Badge variant="default" size="sm">{r.reason}</Badge>
                    <span className="text-base-content/50">
                      {r.postId ? `帖子: ${r.post?.title || r.postId}` : ""}
                      {r.correctionId ? `修改: ${r.correctionId.slice(0, 8)}...` : ""}
                    </span>
                    <span className="text-xs text-base-content/30">
                      {new Date(r.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <div className="flex gap-2 ml-auto">
                      <AdminBtn action={resolveReportAction} variant="success" name="reportId" value={r.id}>解决</AdminBtn>
                      <AdminBtn action={dismissReportAction} variant="ghost" name="reportId" value={r.id}>驳回</AdminBtn>
                      {r.postId && <AdminBtn action={hidePostAction} variant="danger" name="postId" value={r.postId}>隐藏帖子</AdminBtn>}
                      {r.correctionId && <AdminBtn action={hideCorrectionAction} variant="danger" name="correctionId" value={r.correctionId}>隐藏修改</AdminBtn>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Users */}
        <section>
          <h2 className="text-xl font-bold mb-3">用户管理</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>用户名</th>
                  <th>状态</th>
                  <th>角色</th>
                  <th>声望</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>@{u.username}</td>
                    <td><Badge variant={u.status === "ACTIVE" ? "success" : "error"} size="sm">{u.status}</Badge></td>
                    <td>{u.role}</td>
                    <td>{u.profile?.reputationScore ?? 0}</td>
                    <td>
                      {u.role !== "ADMIN" && (
                        u.status === "BANNED" ? (
                          <AdminBtn action={unbanUserAction} variant="success" name="userId" value={u.id}>解封</AdminBtn>
                        ) : (
                          <AdminBtn action={banUserAction} variant="danger" name="userId" value={u.id}>封禁</AdminBtn>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Posts */}
        <section>
          <h2 className="text-xl font-bold mb-3">帖子管理</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>作者</th>
                  <th>状态</th>
                  <th>修改数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="max-w-xs truncate">{p.title || "(无标题)"}</td>
                    <td>@{p.author.username}</td>
                    <td><Badge variant="default" size="sm">{p.status}</Badge></td>
                    <td>{p._count.corrections}</td>
                    <td>
                      {p.status === "HIDDEN" ? (
                        <AdminBtn action={restorePostAction} variant="success" name="postId" value={p.id}>恢复</AdminBtn>
                      ) : (
                        <AdminBtn action={hidePostAction} variant="danger" name="postId" value={p.id}>隐藏</AdminBtn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Corrections */}
        <section>
          <h2 className="text-xl font-bold mb-3">修改建议管理</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>修改内容</th>
                  <th>作者</th>
                  <th>帖子</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((c) => (
                  <tr key={c.id}>
                    <td className="max-w-xs truncate">{c.correctedText.slice(0, 50)}</td>
                    <td>@{c.author.username}</td>
                    <td className="max-w-xs truncate">{c.post?.title || c.postId}</td>
                    <td><Badge variant="default" size="sm">{c.status}</Badge></td>
                    <td>
                      {c.status === "HIDDEN" ? (
                        <AdminBtn action={restoreCorrectionAction} variant="success" name="correctionId" value={c.id}>恢复</AdminBtn>
                      ) : (
                        <AdminBtn action={hideCorrectionAction} variant="danger" name="correctionId" value={c.id}>隐藏</AdminBtn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Admin log */}
        <section>
          <h2 className="text-xl font-bold mb-3">操作日志</h2>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>操作</th>
                  <th>类型</th>
                  <th>目标</th>
                  <th>详情</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.action}</td>
                    <td>{log.targetType}</td>
                    <td className="max-w-xs truncate">{log.targetId || "-"}</td>
                    <td className="max-w-xs truncate">{log.details || "-"}</td>
                    <td className="text-xs">{new Date(log.createdAt).toLocaleString("zh-CN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
