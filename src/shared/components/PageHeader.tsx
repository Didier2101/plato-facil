"use client";

import React, { ReactNode, isValidElement } from 'react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    description?: string;
    icon?: IconType | ReactNode;
    iconColor?: string;
    iconBgColor?: string;
    breadcrumbs?: ReactNode;
    actions?: ReactNode;
    className?: string;
    showBorder?: boolean;
    children?: ReactNode;
    variant?: 'default' | 'reportes' | 'ventas' | 'usuarios' | 'productos' | 'configuraciones';
}

export default function PageHeader({
    title,
    description,
    icon,
    iconColor = "text-orange-500",
    iconBgColor = "bg-slate-900",
    breadcrumbs,
    actions,
    className = "",
    showBorder = true,
    children,
    variant = 'default'
}: PageHeaderProps) {

    // Configuraciones por variante
    const variantConfigs = {
        default: {
            icon: null,
            defaultDescription: '',
        },
        reportes: {
            icon: '📊',
            defaultDescription: 'Análisis del rendimiento de tu restaurante',
        },
        ventas: {
            icon: '💰',
            defaultDescription: 'Gestión de transacciones y facturación',
        },
        usuarios: {
            icon: '👥',
            defaultDescription: 'Administración de usuarios y permisos',
        },
        productos: {
            icon: '🍽️',
            defaultDescription: 'Gestión del menú y productos',
        },
        configuraciones: {
            icon: '⚙️',
            defaultDescription: 'Configuración del sistema',
        }
    };

    const config = variantConfigs[variant];

    // Determinar qué ícono usar
    let finalIcon = icon;

    if (!icon && config.icon) {
        finalIcon = <span className="text-2xl">{config.icon}</span>;
    }

    const isComponent = finalIcon && !isValidElement(finalIcon) &&
        (typeof finalIcon === 'function' ||
            (typeof finalIcon === 'object' && finalIcon !== null && ('render' in finalIcon || (finalIcon as unknown as Record<string, unknown>)?.$$typeof === Symbol.for('react.forward_ref'))));
    const IconComponent = isComponent ? (finalIcon as React.ElementType) : null;

    // Determinar descripción
    const finalDescription = description || config.defaultDescription;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl ${showBorder ? 'border-b border-slate-100' : ''} px-6 py-8 ${className}`}
        >
            <div className="max-w-[1600px] mx-auto">
                {breadcrumbs && (
                    <div className="mb-6">
                        {breadcrumbs}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        {finalIcon && (
                            <div className={`${iconBgColor} h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-slate-200 border border-white/10`}>
                                {IconComponent ? (
                                    <IconComponent className={`text-2xl ${iconColor}`} />
                                ) : (
                                    <div className={`text-2xl ${iconColor}`}>{finalIcon as ReactNode}</div>
                                )}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-tight truncate">
                                {title}
                            </h1>
                            {finalDescription && (
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 line-clamp-1">
                                    {finalDescription}
                                </p>
                            )}
                        </div>
                    </div>

                    {actions && (
                        <div className="flex items-center gap-3">
                            {actions}
                        </div>
                    )}
                </div>

                {children}
            </div>
        </motion.div>
    );
}
