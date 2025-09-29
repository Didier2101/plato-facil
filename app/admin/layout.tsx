import AdminLayoutClient from "@/src/components/layouts/AdminLayoutClient";
import { checkRole } from "@/src/lib/auth/checkRole";


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    await checkRole("admin"); // ✅ valida el rol
    return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
