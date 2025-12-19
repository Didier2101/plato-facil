// app/administrativo/(dueno)/layout.tsx
import { checkRole } from "@/src/lib/auth/checkRole";
import DuenoLayoutClient from "@/src/shared/layouts/DuenoLayoutClient";
import { ROLES } from "@/src/shared/constants/rol";

export default async function DuenoLayout({ children }: { children: React.ReactNode }) {
    // ✅ Solo permite DUEÑO (roles superiores no aplica porque es el máximo)
    const { user } = await checkRole(ROLES.DUENO, false);
    return <DuenoLayoutClient user={user}>{children}</DuenoLayoutClient>;
}