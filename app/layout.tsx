import { Inter } from "next/font/google";
import { SupabaseProvider } from "@/src/components/SupabaseProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: 'swap',
});

export const metadata = {
  title: "PlatoFácil",
  description: "PlatoFácil admin and ordering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased min-h-screen bg-gray-50 text-slate-900`}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}