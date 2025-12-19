// app/administrativo/(admin)/layout.tsx
import { checkRole } from "@/src/lib/auth/checkRole";
import AdminLayoutClient from "@/src/shared/layouts/AdminLayoutClient";
import { ROLES } from "@/src/shared/constants/rol";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // ✅ Permite ADMIN y roles superiores (DUEÑO)
    const { user } = await checkRole(ROLES.ADMIN, true);
    return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}