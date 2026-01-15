import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    hint?: string;
    options: SelectOption[];
    placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
        const selectId = id || React.useId();

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    id={selectId}
                    className={cn(
                        "flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-colors appearance-none cursor-pointer",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                        error
                            ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                            : "border-gray-200 hover:border-gray-300",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? "true" : "false"}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1.5 text-sm text-red-500">{error}</p>
                )}
                {hint && !error && (
                    <p className="mt-1.5 text-sm text-gray-500">{hint}</p>
                )}
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
