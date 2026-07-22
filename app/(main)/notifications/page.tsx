import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { NotificationItem } from "@/components/NotificationItem";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { getNotifications } from "@/server/queries/notifications";
import { markAllReadAction } from "@/server/actions/notifications";

interface Props { searchParams: Promise<{ cursor?: string }>; }

export default async function NotificationsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  const dict = await getDict();
  const { cursor } = await searchParams;
  const { notifications, nextCursor } = await getNotifications({ userId: user!.id, cursor });
  const hasUnread = notifications.some(n => !n.isRead);

  return (
    <AppShell>
      <PageHeader title={dict.notifications.title} description={dict.notifications.desc} action={
        hasUnread ? <form action={markAllReadAction}><Button variant="outline" size="sm" type="submit">{dict.notifications.markAllRead}</Button></form> : undefined
      } />
      {notifications.length === 0 ? (
        <EmptyState icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>} title={dict.notifications.empty} description={dict.notifications.emptyDesc} />
      ) : (
        <div className="space-y-3 pb-8">
          {notifications.map(n => <NotificationItem key={n.id} {...n} dict={dict} />)}
          {nextCursor && <div className="text-center mt-6"><a href={`/notifications?cursor=${nextCursor}`} className="btn btn-outline btn-sm">{dict.notifications.loadMore}</a></div>}
        </div>
      )}
    </AppShell>
  );
}
