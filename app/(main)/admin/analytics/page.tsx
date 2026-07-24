import { notFound } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AdminNav } from "@/components/AdminNav";
import { getAnalytics, getDailyTrend, getFunnel } from "@/server/queries/analytics";
import { TimeRangeTabs } from "@/components/TimeRangeTabs";
import { TrendChart } from "@/components/TrendChart";
import { FunnelChart } from "@/components/FunnelChart";

interface Props {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  const dict = await getDict();

  const { range: rangeParam } = await searchParams;
  const range = (rangeParam === "today" || rangeParam === "7d" || rangeParam === "30d") ? rangeParam : "7d";

  const [metrics, usersTrend, postsTrend, correctionsTrend, closedTrend, funnel] = await Promise.all([
    getAnalytics(range),
    getDailyTrend(range, "new_users"),
    getDailyTrend(range, "new_posts"),
    getDailyTrend(range, "new_corrections"),
    getDailyTrend(range, "closed_loop"),
    getFunnel(range),
  ]);

  return (
    <AppShell>
      <PageHeader title="数据看板" description="核心产品指标" />
      <AdminNav
        overview={dict.admin?.overview || "概览"}
        analytics={dict.admin?.analytics || "数据看板"}
        topics={dict.admin?.topics?.title || "话题管理"}
      />
      <TimeRangeTabs current={range} />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {[
          { label: "新增用户", value: metrics.newUsers },
          { label: "活跃用户", value: metrics.activeUsers },
          { label: "新增表达", value: metrics.newPosts },
          { label: "新增修改", value: metrics.newCorrections },
          { label: "有效闭环", value: metrics.closedLoop },
          { label: "闭环率", value: `${(metrics.closedLoopRate * 100).toFixed(1)}%` },
          { label: "24h反馈覆盖率", value: `${(metrics.feedbackCoverage24h * 100).toFixed(1)}%` },
          { label: "首次反馈中位", value: `${metrics.medianFirstFeedbackMin}min` },
          { label: "收藏率", value: `${(metrics.librarySaveRate * 100).toFixed(1)}%` },
        ].map((m) => (
          <Card key={m.label} padding="sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{m.value}</p>
              <p className="text-xs text-ink-muted mt-1">{m.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Trend Chart */}
      <Card className="mb-8">
        <h3 className="font-semibold mb-4">每日趋势</h3>
        <TrendChart users={usersTrend} posts={postsTrend} corrections={correctionsTrend} closed={closedTrend} />
      </Card>

      {/* Funnel */}
      <Card className="mb-8">
        <h3 className="font-semibold mb-4">简化漏斗</h3>
        <FunnelChart data={funnel} />
      </Card>

      {/* Cloudflare link */}
      <div className="text-center mb-8">
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ink-faint hover:text-base-content"
        >
          Cloudflare Analytics 外部入口 →
        </a>
      </div>
    </AppShell>
  );
}
