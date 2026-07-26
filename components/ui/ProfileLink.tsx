"use client";

import { useRouter } from "next/navigation";

export function ProfileLink({
  username,
  children,
  className,
}: {
  username: string;
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        router.push(`/profile/${username}`);
      }}
      className={className}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          router.push(`/profile/${username}`);
        }
      }}
    >
      {children}
    </span>
  );
}
