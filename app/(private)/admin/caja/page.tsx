// app/caja/page.tsx (o donde tengas la página de caja)
import CajaLista from "@/src/components/admin/caja/CajaLista";
import { checkRole } from "@/src/lib/auth/checkRole";


export default async function CajaPage() {
    // Obtener datos del usuario autenticado
    const { user } = await checkRole('admin'); // o el rol que corresponda

    return <CajaLista usuarioId={user.id} />;
}