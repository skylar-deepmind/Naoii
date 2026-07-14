import { cn } from "@/lib/utils";

const variantClasses = {
  default: "badge-ghost",
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
} as const;

const sizeClasses = {
  sm: "badge-sm",
  md: "",
} as const;

type BadgeVariant = keyof typeof variantClasses;
type BadgeSize = keyof typeof sizeClasses;

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "badge",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
