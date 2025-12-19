// src/shared/components/PageHeader.tsx
'use client';

import { ReactNode } from 'react';
import { IconType } from 'react-icons';

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
    iconColor = "text-white",
    iconBgColor,
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
            defaultIconBgColor: 'bg-orange-500'
        },
        reportes: {
            icon: '📊',
            defaultDescription: 'Análisis del rendimiento de tu restaurante',
            defaultIconBgColor: 'bg-orange-500'
        },
        ventas: {
            icon: '💰',
            defaultDescription: 'Gestión de transacciones y facturación',
            defaultIconBgColor: 'bg-green-500'
        },
        usuarios: {
            icon: '👥',
            defaultDescription: 'Administración de usuarios y permisos',
            defaultIconBgColor: 'bg-blue-500'
        },
        productos: {
            icon: '🍽️',
            defaultDescription: 'Gestión del menú y productos',
            defaultIconBgColor: 'bg-purple-500'
        },
        configuraciones: {
            icon: '⚙️',
            defaultDescription: 'Configuración del sistema',
            defaultIconBgColor: 'bg-gray-600'
        }
    };

    const config = variantConfigs[variant];

    // Determinar qué ícono usar
    let finalIcon = icon;
    const finalIconBgColor = iconBgColor || config.defaultIconBgColor;

    if (!icon && config.icon) {
        finalIcon = <span className="text-2xl">{config.icon}</span>;
    }

    const IconComponent = typeof finalIcon === 'function' ? finalIcon : null;

    // Determinar descripción
    const finalDescription = description || config.defaultDescription;

    return (
        <div className={`bg-white ${showBorder ? 'border-b border-gray-200' : ''} px-6 py-8 ${className}`}>
            <div>
                {breadcrumbs && (
                    <div className="mb-4">
                        {breadcrumbs}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        {finalIcon && (
                            <div className={`${finalIconBgColor} p-4 rounded-xl shrink-0`}>
                                {IconComponent ? (
                                    // Es un componente de React Icon
                                    <IconComponent className={`text-2xl ${iconColor}`} />
                                ) : (
                                    // Es un elemento React o string
                                    <div className={`text-2xl ${iconColor}`}>{finalIcon as ReactNode}</div>
                                )}
                            </div>
                        )}

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                                {title}
                            </h1>
                            {finalDescription && (
                                <p className="text-gray-600 mt-1">{finalDescription}</p>
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
        </div>
    );
}