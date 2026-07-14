import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: InputProps) {
  const inputId = id || label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="form-control w-full">
      {label && (
        <label htmlFor={inputId} className="label py-1.5">
          <span className="label-text text-sm font-medium">{label}</span>
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "input input-bordered w-full",
          error && "input-error",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-error text-sm mt-1.5" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-base-content/50 text-sm mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}
