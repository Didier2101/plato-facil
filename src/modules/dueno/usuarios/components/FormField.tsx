// src/modules/dueno/usuarios/components/FormField.tsx
'use client';

import { ReactNode } from 'react';
import { UseFormRegister, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
    label: string;
    name: Path<T>;
    type?: string;
    placeholder?: string;
    icon?: ReactNode;
    register: UseFormRegister<T>;
    error?: string;
    required?: boolean;
    showPasswordToggle?: boolean;
    showPassword?: boolean;
    onTogglePassword?: () => void;
    options?: Array<{ value: string; label: string }>;
}

export default function FormField<T extends FieldValues>({
    label,
    name,
    type = 'text',
    placeholder = '',
    icon,
    register,
    error,
    required = false,
    showPasswordToggle = false,
    showPassword = false,
    onTogglePassword,
    options
}: FormFieldProps<T>) {
    const isSelect = type === 'select';

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-3 text-gray-400">
                        {icon}
                    </div>
                )}

                {isSelect && options ? (
                    <>
                        <select
                            {...register(name)}
                            className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border ${error ? 'border-red-300' : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white appearance-none`}
                        >
                            <option value="">Selecciona...</option>
                            {options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-3 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </>
                ) : (
                    <>
                        <input
                            type={showPassword ? 'text' : type}
                            {...register(name)}
                            placeholder={placeholder}
                            className={`w-full ${icon ? 'pl-10' : 'pl-4'} ${showPasswordToggle ? 'pr-10' : 'pr-4'
                                } py-3 border ${error ? 'border-red-300' : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white`}
                        />
                        {showPasswordToggle && onTogglePassword && (
                            <button
                                type="button"
                                onClick={onTogglePassword}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
            {error && (
                <p className="text-red-600 text-sm mt-1">{error}</p>
            )}
        </div>
    );
}