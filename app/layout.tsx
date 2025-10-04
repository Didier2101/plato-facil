import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kavvo",
    description: "Sistema de gestión",
    icons: {
        icon: [
            {
                url: "/assets/logo-kavvo-solo.png",
                sizes: "32x32",
                type: "image/png",
            },
            {
                url: "/assets/logo-kavvo-solo.png",
                sizes: "16x16",
                type: "image/png",
            },
        ],
        apple: [
            {
                url: "/assets/logo-kavvo-solo.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}