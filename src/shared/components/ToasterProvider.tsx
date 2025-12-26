// src/shared/components/ToasterProvider.tsx
'use client';

import { Toaster } from 'sonner';

export function ToasterProvider() {
    return (
        <Toaster
            position="top-center"
            expand={true}
            richColors={false}
            duration={3500}
            offset="20px"
            toastOptions={{
                className: "bg-transparent border-none shadow-none pointer-events-none p-0 !w-auto",
                style: { background: 'transparent', border: 'none', boxShadow: 'none' }
            }}
        />
    );
}
