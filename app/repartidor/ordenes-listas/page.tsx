// import DomiciliarioPanel from '@/src/components/domiciliario/DomiciliarioPanel'
import DomiciliarioPanel from '@/src/components/domiciliario/DomiciliarioPanel';
import { checkRole } from '@/src/lib/auth/checkRole';


export default async function page() {
    const { user } = await checkRole('repartidor');
    return (
        <DomiciliarioPanel usuarioId={user.id} />
    )
}
