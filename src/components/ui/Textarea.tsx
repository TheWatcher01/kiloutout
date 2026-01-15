import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, hint, id, ...props }, ref) => {
        const textareaId = id || React.useId();

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        "flex min-h-[100px] w-full rounded-lg border bg-white px-4 py-3 text-sm transition-colors resize-y",
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
                    {...props}
                />
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
Textarea.displayName = "Textarea";

export { Textarea };
