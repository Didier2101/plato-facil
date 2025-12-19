// app/administrativo/(repartidor)/layout.tsx
import { checkRole } from "@/src/lib/auth/checkRole";
import RepartidorLayoutClient from "@/src/shared/layouts/RepartidorLayoutClient";
import { ROLES } from "@/src/shared/constants/rol";

export default async function RepartidorLayout({ children }: { children: React.ReactNode }) {
    // ✅ Solo permite REPARTIDOR
    const { user } = await checkRole(ROLES.REPARTIDOR, false);
    return <RepartidorLayoutClient user={user}>{children}</RepartidorLayoutClient>;
}