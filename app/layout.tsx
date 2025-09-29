import "@/app/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Plato Fácil",
    description: "Sistema de gestión",
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