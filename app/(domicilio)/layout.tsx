import DomiciliosLayoutClient from "@/src/components/layouts/DomiciliosLayoutClient";
import CookieBanner from "@/src/components/ui/CookieBanner";


export default async function DuenoLayout({ children }: { children: React.ReactNode }) {

    return <DomiciliosLayoutClient>{children} <CookieBanner /> </DomiciliosLayoutClient>;
}
