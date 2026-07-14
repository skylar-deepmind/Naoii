import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "p-0",
  sm: "card-body p-3",
  md: "card-body p-5",
  lg: "card-body p-8",
};

export function Card({
  children,
  className,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "card bg-base-100 border border-base-200",
        hover && "transition-shadow hover:shadow-md cursor-pointer",
        className
      )}
    >
      <div className={cn(paddingClasses[padding])}>{children}</div>
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h3 className="font-semibold text-base">{title}</h3>
        {subtitle && (
          <p className="text-sm text-base-content/60 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-4 pt-4 border-t border-base-200 flex items-center justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}
