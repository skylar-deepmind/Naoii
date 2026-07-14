import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PostForm } from "@/components/PostForm";
import { getLanguages } from "@/server/queries/user";
import { getDict } from "@/lib/i18n";

export default async function NewPostPage() {
  const languages = await getLanguages();
  const dict = await getDict();

  return (
    <AppShell>
      <PageHeader title={dict.post.newTitle} description={dict.post.newDesc} />
      <div className="max-w-2xl pb-8">
        <Card><PostForm languages={languages} dict={dict} /></Card>
      </div>
    </AppShell>
  );
}
