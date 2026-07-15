import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { PostForm } from "@/components/PostForm";
import { getLanguages } from "@/server/queries/user";
import { getDict } from "@/lib/i18n";

interface Props {
  searchParams: Promise<{ intent?: string }>;
}

export default async function NewPostPage({ searchParams }: Props) {
  const languages = await getLanguages();
  const dict = await getDict();
  const { intent } = await searchParams;

  return (
    <AppShell>
      <PageHeader
        title={intent === "ask" ? dict.entry.askQuestion : dict.post.newTitle}
        description={intent === "ask" ? dict.entry.askQuestionDesc : dict.post.newDesc}
      />
      <div className="max-w-2xl pb-8">
        <Card><PostForm languages={languages} dict={dict} intent={intent || null} /></Card>
      </div>
    </AppShell>
  );
}
