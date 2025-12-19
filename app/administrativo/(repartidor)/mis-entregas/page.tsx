import MisDomiciliosComponent from '@/src/modules/repartidor/entregas/components/MisDomiciliosComponent'
import { checkRole } from '@/src/lib/auth/checkRole';
// import MisEntregas from '@/src/components/domiciliario/MisEntregas'


export default async function page() {
    const { user } = await checkRole('repartidor');
    return <MisDomiciliosComponent usuarioId={user.id} />
}
