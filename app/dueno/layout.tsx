import { checkRole } from "@/src/lib/auth/checkRole";
import DuenoLayoutClient from "@/src/components/layouts/DuenoLayoutClient";


export default async function DuenoLayout({ children }: { children: React.ReactNode }) {
    await checkRole("dueno");
    return <DuenoLayoutClient>{children}</DuenoLayoutClient>;
}
