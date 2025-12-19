// src/lib/auth/checkRole.ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { tieneMayorJerarquia } from '@/src/shared/constants/rol';
import { PUBLIC_ROUTES } from '@/src/shared/constants/app-routes';
import type { Rol } from '@/src/shared/types/rol';
import type { Usuario } from '@/src/shared/types/rol';

/**
 * Verifica que el usuario esté autenticado y tenga el rol requerido
 * @param requiredRole - Rol mínimo requerido
 * @param allowHigherRoles - Si true, permite roles superiores (por defecto true)
 * @returns Usuario autenticado con sus datos
 */
export async function checkRole(
    requiredRole: Rol,
    allowHigherRoles: boolean = true
): Promise<{ user: Usuario }> {
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
                        // Server Component - ignorar error
                    }
                },
            },
        }
    );

    // ✅ PASO 3: Verificar usuario autenticado
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect(PUBLIC_ROUTES.LOGIN);
    }

    // ✅ PASO 4: Obtener datos completos del usuario
    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, email, nombre, rol, activo, created_at, updated_at, deleted_at')
        .eq('id', user.id)
        .single();

    if (error || !usuario) {
        console.error('Error obteniendo usuario:', error);
        redirect(`${PUBLIC_ROUTES.LOGIN}?error=usuario_no_encontrado`);
    }

    // ✅ Verificar que el usuario esté activo
    if (!usuario.activo) {
        redirect(`${PUBLIC_ROUTES.LOGIN}?error=usuario_inactivo`);
    }

    const userRole = usuario.rol as Rol;

    // ✅ PASO 5: Verificar permisos con jerarquía
    if (allowHigherRoles) {
        // Permitir rol exacto o roles superiores (ej: dueño puede acceder a rutas de admin)
        if (!tieneMayorJerarquia(userRole, requiredRole)) {
            redirect(`${PUBLIC_ROUTES.LOGIN}?error=acceso_denegado`);
        }
    } else {
        // Solo permitir rol exacto
        if (userRole !== requiredRole) {
            redirect(`${PUBLIC_ROUTES.LOGIN}?error=acceso_denegado`);
        }
    }

    // ✅ Retornar datos completos del usuario
    return {
        user: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre ?? undefined,
            rol: userRole,
            activo: usuario.activo,
            created_at: usuario.created_at,
            updated_at: usuario.updated_at ?? undefined,
            deleted_at: usuario.deleted_at ?? undefined,
        },
    };
}

/**
 * Verifica que el usuario esté autenticado (sin verificar rol específico)
 */
export async function checkAuth(): Promise<{ user: Usuario }> {
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

    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect(PUBLIC_ROUTES.LOGIN);
    }

    const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error || !usuario || !usuario.activo) {
        redirect(PUBLIC_ROUTES.LOGIN);
    }

    return {
        user: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre ?? undefined,
            rol: usuario.rol as Rol,
            activo: usuario.activo,
            created_at: usuario.created_at,
            updated_at: usuario.updated_at ?? undefined,
            deleted_at: usuario.deleted_at ?? undefined,
        },
    };
}
