import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArticleEditor } from "@/components/ArticleEditor";
import { getCurrentUser } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }>; }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();
  const dict = await getDict();

  if (!user) redirect("/login");

  const entry = await prisma.entry.findUnique({
    where: { id },
    select: {
      id: true,
      type: true,
      title: true,
      content: true,
      coverImage: true,
      tags: true,
      visibility: true,
      authorId: true,
    },
  });

  if (!entry || entry.type !== "ARTICLE") notFound();
  if (entry.authorId !== user.id) notFound();

  return (
    <AppShell>
      <PageHeader
        title={dict.article?.editTitle || "编辑篇章"}
        description={dict.article?.editDesc || "修改你的文章"}
      />
      <div className="max-w-3xl pb-8">
        <ArticleEditor
          dict={dict}
          editEntry={{
            id: entry.id,
            title: entry.title,
            content: entry.content,
            coverImage: entry.coverImage,
            tags: entry.tags as string[],
            visibility: entry.visibility,
          }}
        />
      </div>
    </AppShell>
  );
}
