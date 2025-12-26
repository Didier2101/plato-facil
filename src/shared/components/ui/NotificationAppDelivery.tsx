"use client";

import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

interface NotificationAppDeliveryProps {
    title: string;
    description?: string;
    icon: React.ReactNode;
    type: NotificationType;
    onClose?: () => void;
    action?: {
        label: React.ReactNode;
        onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    };
}

const typeStyles: Record<NotificationType, string> = {
    success: "border-orange-500 bg-gradient-to-r from-orange-50/80 to-white/90",
    error: "border-red-500 bg-gradient-to-r from-red-50/80 to-white/90",
    warning: "border-amber-400 bg-gradient-to-r from-amber-50/80 to-white/90",
    info: "border-slate-900 bg-gradient-to-r from-slate-50/80 to-white/90",
    loading: "border-orange-200 bg-white/90",
};

const iconBgStyles: Record<NotificationType, string> = {
    success: "bg-orange-500 shadow-orange-200",
    error: "bg-red-500 shadow-red-200",
    warning: "bg-amber-400 shadow-amber-200",
    info: "bg-slate-900 shadow-slate-200",
    loading: "bg-orange-100",
};

export default function NotificationAppDelivery({
    title,
    description,
    icon,
    type,
    onClose,
    action,
}: NotificationAppDeliveryProps) {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            className={`
                relative w-full max-w-[400px] pointer-events-auto
                ${typeStyles[type]} 
                border shadow-[0_20px_50px_rgba(0,0,0,0.1)] 
                backdrop-blur-xl rounded-[2.5rem] p-5 pr-12
                flex items-center gap-4 transition-all duration-300
            `}
        >
            {/* Main Icon with Glow */}
            <div className={`
                flex-shrink-0 h-14 w-14 rounded-[1.5rem] 
                flex items-center justify-center text-white
                shadow-lg ${iconBgStyles[type]}
            `}>
                {icon}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none">
                    {title}
                </h4>
                {description && (
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1 leading-tight line-clamp-2">
                        {description}
                    </p>
                )}

                {action && (
                    <button
                        onClick={(e) => {
                            action.onClick(e);
                            onClose?.();
                        }}
                        className="mt-3 bg-slate-900 hover:bg-orange-500 text-white font-black text-[9px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        {action.label}
                    </button>
                )}
            </div>

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 bg-slate-100/50 hover:bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 transition-all border border-gray-100"
                >
                    <X className="h-4 w-4" />
                </button>
            )}

            {/* Progress Bar for Type Accent (Visual Only) */}
            <div className={`
                absolute bottom-4 left-24 right-12 h-1 rounded-full bg-gray-100 overflow-hidden
            `}>
                <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 3.5, ease: "linear" }}
                    className={`h-full ${type === 'loading' ? 'bg-orange-200 animate-pulse' : 'bg-current'} opacity-20`}
                />
            </div>
        </motion.div>
    );
}
