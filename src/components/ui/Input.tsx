import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, hint, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        "flex h-11 w-full rounded-lg border bg-white px-4 py-2 text-sm transition-colors",
                        "placeholder:text-gray-400",
                        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                        error
                            ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                            : "border-gray-200 hover:border-gray-300",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-500">
                        {error}
                    </p>
                )}
                {hint && !error && (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-gray-500">
                        {hint}
                    </p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
