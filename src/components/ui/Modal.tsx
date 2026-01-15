"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    description?: string;
    size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
};

export function Modal({
    isOpen,
    onClose,
    children,
    title,
    description,
    size = "md",
}: ModalProps) {
    // Fermer avec Escape
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative z-50 w-full mx-4 bg-white rounded-xl shadow-xl",
                    "transform transition-all duration-200",
                    "animate-in fade-in-0 zoom-in-95",
                    sizeClasses[size]
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                aria-describedby={description ? "modal-description" : undefined}
            >
                {/* Header */}
                {(title || description) && (
                    <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
                        <div>
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-xl font-semibold text-gray-900"
                                >
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p
                                    id="modal-description"
                                    className="mt-1 text-sm text-gray-500"
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Close button si pas de header */}
                {!title && !description && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-end gap-3 pt-4 border-t border-gray-100 -mx-6 -mb-6 px-6 py-4 bg-gray-50 rounded-b-xl",
                className
            )}
        >
            {children}
        </div>
    );
}
