import NotFound from '@/src/shared/components/NotFound'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Página No Encontrada - KAVVO',
    description: 'La página que buscas no existe en KAVVO. Regresa al inicio o solicita un domicilio.',
    robots: 'noindex, nofollow' // Para que los buscadores no indexen la página 404
}

export default function NotFoundPage() {
    return <NotFound />
}