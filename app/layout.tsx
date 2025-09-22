import { Poppins } from "next/font/google";
import { SupabaseProvider } from "@/src/components/SupabaseProvider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // los pesos que necesites
});

export const metadata = {
  title: "PlatoFácil",
  description: "PlatoFácil admin and ordering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${poppins.className} min-h-screen bg-gray-50 text-slate-900`}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
