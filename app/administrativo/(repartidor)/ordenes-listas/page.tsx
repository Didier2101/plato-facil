// import DomiciliarioPanel from '@/src/modules/repartidor/entregas/components/DomiciliarioPanel'
import DomiciliarioPanel from '@/src/modules/repartidor/entregas/components/DomiciliarioPanel';
import { checkRole } from '@/src/lib/auth/checkRole';


export default async function page() {
    const { user } = await checkRole('repartidor');
    return (
        <DomiciliarioPanel usuarioId={user.id} />
    )
}
