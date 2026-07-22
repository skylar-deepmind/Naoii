import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleEditor } from "@/components/ArticleEditor";
import { getDict } from "@/lib/i18n";

export default async function NewArticlePage() {
  const dict = await getDict();

  return (
    <AppShell>
      <PageHeader
        title={dict.article?.newTitle || "写篇章"}
        description={dict.article?.newDesc || "写一篇日记、博客或长文章"}
      />
      <div className="max-w-3xl pb-8">
        <ArticleEditor dict={dict} />
      </div>
    </AppShell>
  );
}
