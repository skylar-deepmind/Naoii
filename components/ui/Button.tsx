import Link from "next/link";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  success:
    "bg-success text-success-content hover:opacity-90 border-success",
  danger:
    "bg-error text-error-content hover:opacity-90 border-error",
} as const;

const sizeClasses = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
} as const;

type ButtonVariant = keyof typeof variantClasses;
type ButtonSize = keyof typeof sizeClasses;

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  href?: undefined;
}

interface ButtonAsLink
  extends ButtonBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  href: string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "btn",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  const content = (
    <>
      {loading && <span className="loading loading-spinner loading-xs" />}
      {!loading && icon && <span className="inline-flex">{icon}</span>}
      {children}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {content}
      </Link>
    );
  }

  const { ...buttonProps } = props as ButtonAsButton;
  return (
    <button className={classes} disabled={loading || buttonProps.disabled} {...buttonProps}>
      {content}
    </button>
  );
}
