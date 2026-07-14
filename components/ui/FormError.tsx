import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      className={cn("text-error text-sm mt-1.5", className)}
      role="alert"
    >
      {message}
    </p>
  );
}
