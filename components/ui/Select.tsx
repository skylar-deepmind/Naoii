import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  id,
  options,
  placeholder,
  className,
  ...props
}: SelectProps) {
  const selectId = id || label?.replace(/\s+/g, "-").toLowerCase();

  return (
    <div className="form-control w-full">
      {label && (
        <label htmlFor={selectId} className="label py-1.5">
          <span className="label-text text-sm font-medium">{label}</span>
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "select select-bordered w-full",
          error && "select-error",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
        }
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          id={`${selectId}-error`}
          className="text-error text-sm mt-1.5"
          role="alert"
        >
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${selectId}-hint`} className="text-base-content/50 text-sm mt-1.5">
          {hint}
        </p>
      )}
    </div>
  );
}
