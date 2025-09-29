// app/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function HomePage() {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Server Component
                    }
                },
            },
        }
    );

    // Verificar si hay sesión activa
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Si hay sesión, obtener el rol y redirigir al dashboard correspondiente
        const { data: usuario } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('id', session.user.id)
            .single();

        if (usuario) {
            switch (usuario.rol) {
                case 'admin':
                    redirect('/admin/caja');
                case 'dueno':
                    redirect('/dueno/reportes');
                case 'repartidor':
                    redirect('/repartidor/ordenes-listas');
                default:
                    redirect('/login');
            }
        }
    }

    // Si no hay sesión, ir a login
    redirect('/login');
}