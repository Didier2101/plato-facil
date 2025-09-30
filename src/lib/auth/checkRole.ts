// src/lib/auth/checkRole.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

type UserRole = 'dueno' | 'admin' | 'repartidor';

export async function checkRole(requiredRole: UserRole) {
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

    // ✅ PASO 3: Verificar usuario de forma SEGURA
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // ✅ PASO 4: Verificar rol del usuario Y obtener sus datos
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre, rol, activo')
        .eq('id', user.id)
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

    // ✅ Retornar datos completos del usuario
    return {
        user: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol as UserRole,
            activo: usuario.activo,
        }
    };
}