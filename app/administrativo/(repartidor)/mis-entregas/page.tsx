import MisDomiciliosComponent from '@/src/modules/repartidor/entregas/components/MisDomiciliosComponent';
import { checkRole } from '@/src/lib/auth/checkRole';

export default async function Page() {
    const { user } = await checkRole('repartidor');

    return (
        <MisDomiciliosComponent usuarioId={user.id} />
    );
}
