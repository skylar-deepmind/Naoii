import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div
      className={cn(
        "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full",
        className
      )}
    >
      {children}
    </div>
  );
}
