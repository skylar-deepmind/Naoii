"use client";

import { useRouter } from "next/navigation";

export function TopicBadgeLink({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/topics/${slug}`);
      }}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          router.push(`/topics/${slug}`);
        }
      }}
    >
      {children}
    </span>
  );
}
