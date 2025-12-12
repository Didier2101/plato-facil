// app/admin/layout.tsx
import AdminLayoutClient from "@/src/components/layouts/AdminLayoutClient";
import { checkRole } from "@/src/lib/auth/checkRole";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = await checkRole("admin"); // ✅ Destructura user

    return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>;
}