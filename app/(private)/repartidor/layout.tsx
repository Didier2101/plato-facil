import { checkRole } from "@/src/lib/auth/checkRole";
import RepartidorLayoutClient from "@/src/components/layouts/RepartidorLayoutClient";

export default async function RepartidorLayout({ children }: { children: React.ReactNode }) {
    const { user } = await checkRole("repartidor");
    return <RepartidorLayoutClient user={user}>{children}</RepartidorLayoutClient>;
}
