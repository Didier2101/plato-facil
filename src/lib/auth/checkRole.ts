// src/lib/auth/checkRole.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

export async function checkRole(requiredRole: string) {
    // ✅ PASO 1: Await cookies()
    const cookieStore = await cookies();

    // ✅ PASO 2: Crear cliente con @supabase/ssr
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

    // ✅ PASO 3: Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        redirect('/login');
    }

    // ✅ PASO 4: Verificar rol del usuario
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('rol, activo')
        .eq('id', session.user.id)
        .single();

    if (error || !usuario) {
        console.error('Error obteniendo usuario:', error);
        redirect('/login');
    }

    if (!usuario.activo) {
        redirect('/login?error=usuario_inactivo');
    }

    if (usuario.rol !== requiredRole) {
        redirect('/login?error=acceso_denegado');
    }

    return { session, usuario };
}