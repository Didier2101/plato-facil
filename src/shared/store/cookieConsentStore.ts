// src/store/cookieConsentStore.ts
import { create } from 'zustand';

interface CookieConsentStore {
    hasConsent: boolean;
    consentDate: string | null;
    setConsent: (consent: boolean) => void;
    checkConsent: () => boolean;
    initializeFromCookie: () => void;
}

// Funciones auxiliares para manejar cookies
const setCookie = (name: string, value: string, days: number = 365) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(nameEQ)) {
            return cookie.substring(nameEQ.length);
        }
    }
    return null;
};

export const useCookieConsentStore = create<CookieConsentStore>((set, get) => ({
    hasConsent: false,
    consentDate: null,

    setConsent: (consent: boolean) => {
        if (consent) {
            const now = new Date().toISOString();
            setCookie('cookie-consent', 'true', 365);
            setCookie('consent-date', now, 365);
            set({
                hasConsent: true,
                consentDate: now,
            });
        } else {
            // Borrar cookies si el usuario revoca el consentimiento
            document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            document.cookie = 'consent-date=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            set({
                hasConsent: false,
                consentDate: null,
            });
        }
    },

    checkConsent: () => {
        return get().hasConsent;
    },

    initializeFromCookie: () => {
        const consentCookie = getCookie('cookie-consent');
        const dateCookie = getCookie('consent-date');

        if (consentCookie === 'true') {
            set({
                hasConsent: true,
                consentDate: dateCookie || null,
            });
        }
    },
}));