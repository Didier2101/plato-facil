import Unauthorized from '@/src/shared/components/Unauthorized'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Acceso Denegado - Error 403 | KAVVO',
    description: 'No tienes permisos para acceder a esta sección del sistema KAVVO. Serás redirigido automáticamente a tu área correspondiente.',
    robots: 'noindex, nofollow'
}

export default function UnauthorizedPage() {
    return <Unauthorized />
}