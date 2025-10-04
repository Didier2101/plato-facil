import DomiciliosLayoutClient from "@/src/components/layouts/DomiciliosLayoutClient";

export default async function DuenoLayout({ children }: { children: React.ReactNode }) {

    return <DomiciliosLayoutClient>{children}</DomiciliosLayoutClient>;
}
