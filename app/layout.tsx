import "@/app/globals.css";
import { ToasterProvider } from "@/src/shared/components/ToasterProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Kavvo - Tu propia app de domicilios",
    description:
        "Kavvo permite a cada restaurante tener su propia aplicación personalizada de domicilios y gestión de pedidos online.",
    keywords: [
        "Kavvo",
        "app de domicilios para restaurantes",
        "plataforma de pedidos",
        "gestión de restaurantes",
        "delivery personalizado",
        "software de domicilios",
    ],
    openGraph: {
        title: "Kavvo - Tu propia app de domicilios",
        description:
            "Con Kavvo, cada restaurante puede ofrecer pedidos y domicilios desde su propia aplicación personalizada.",
        url: "https://kavvo.store",
        siteName: "Kavvo",
        images: [
            {
                url: "/assets/logo-kavvo-solo.png",
                width: 800,
                height: 600,
                alt: "Logo de Kavvo",
            },
        ],
        locale: "es_ES",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Kavvo - App de domicilios para restaurantes",
        description:
            "Kavvo ayuda a restaurantes a tener su propia app de domicilios personalizada.",
        images: ["/assets/logo-kavvo-solo.png"],
    },
    icons: {
        icon: [
            { url: "/assets/logo-kavvo-solo.png", sizes: "32x32", type: "image/png" },
            { url: "/assets/logo-kavvo-solo.png", sizes: "16x16", type: "image/png" },
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
        <html lang="es">
            <body suppressHydrationWarning>{children}

                <ToasterProvider />
            </body>
        </html>
    );
}
