import { cn } from "@/lib/utils";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="form-control w-full">
      {label && (
        <label htmlFor={textareaId} className="label py-1.5">
          <span className="label-text text-sm font-medium">{label}</span>
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          "textarea textarea-bordered w-full",
          error && "textarea-error",
          className
        )}
        rows={4}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
        }
        {...props}
      />
      {error && (
        <p
          id={`${textareaId}-error`}
          className="text-error text-sm mt-1.5"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${textareaId}-hint`} className="text-base-content/50 text-sm mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}
