import { checkRole } from "@/src/lib/auth/checkRole";
import DuenoLayoutClient from "@/src/components/layouts/DuenoLayoutClient";


export default async function DuenoLayout({ children }: { children: React.ReactNode }) {
    const { user } = await checkRole("dueno");
    return <DuenoLayoutClient user={user}>{children}</DuenoLayoutClient>;
}
