"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    label?: string;
    description?: string;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, description, id, onCheckedChange, ...props }, ref) => {
        const checkboxId = id || React.useId();

        const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(event.target.checked);
        };

        return (
            <div className="flex items-start gap-3">
                <div className="relative flex items-center justify-center">
                    <input
                        type="checkbox"
                        id={checkboxId}
                        ref={ref}
                        className={cn(
                            "peer h-5 w-5 shrink-0 rounded border-2 border-gray-300 bg-white transition-colors",
                            "checked:bg-primary checked:border-primary",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "appearance-none cursor-pointer",
                            className
                        )}
                        onChange={handleChange}
                        {...props}
                    />
                    <Check className="absolute h-3.5 w-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                {(label || description) && (
                    <div className="flex flex-col">
                        {label && (
                            <label
                                htmlFor={checkboxId}
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <span className="text-xs text-gray-500">{description}</span>
                        )}
                    </div>
                )}
            </div>
        );
    }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
