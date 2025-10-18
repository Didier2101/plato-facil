// src/components/CookieBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { useCookieConsentStore } from "@/src/store/cookieConsentStore";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { hasConsent, setConsent, initializeFromCookie } = useCookieConsentStore();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // Inicializar desde el cookie al montar
        initializeFromCookie();
    }, [isMounted, initializeFromCookie]);

    useEffect(() => {
        if (!isMounted) return;

        // Mostrar banner solo si no hay consentimiento
        if (!hasConsent) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [hasConsent, isMounted]);

    const handleAccept = () => {
        setConsent(true);
        setIsVisible(false);
    };

    const handleReject = () => {
        setConsent(false);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-2xl z-[100] md:p-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">🍪 Política de Cookies</h3>
                    <p className="text-sm text-gray-300">
                        Utilizamos cookies para mejorar tu experiencia, analizar el tráfico y personalizar el contenido.
                        Al continuar navegando, aceptas nuestra política de cookies.
                    </p>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                    <button
                        onClick={handleReject}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                        aria-label="Rechazar cookies"
                    >
                        Rechazar
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-medium transition-colors"
                        aria-label="Aceptar cookies"
                    >
                        Aceptar
                    </button>
                </div>
            </div>
        </div>
    );
}