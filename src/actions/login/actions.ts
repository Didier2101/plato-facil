'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

type LoginResult = {
    success: boolean;
    error?: string;
    user?: { id: string; email: string; nombre?: string | null; rol?: 'dueno' | 'admin' | 'repartidor' };
};

export async function loginAction(formData: FormData): Promise<LoginResult> {
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
        return { success: false, error: 'Email y contraseña son requeridos' };
    }

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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError) {
        console.error('Error de auth:', authError);
        if (authError.message.includes('banned') || authError.code === 'user_banned') {
            return { success: false, error: 'Tu cuenta ha sido desactivada. Contacta al administrador.' };
        }
        if (authError.message.includes('Invalid login credentials')) {
            return { success: false, error: 'Correo electrónico o contraseña incorrectos' };
        }
        return { success: false, error: 'Error al iniciar sesión. Intenta de nuevo.' };
    }

    if (!authData.user) {
        return { success: false, error: 'No se pudo obtener información del usuario' };
    }

    const { data: usuario, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id, email, nombre, rol, activo')
        .eq('id', authData.user.id)
        .single();

    if (usuarioError || !usuario) {
        console.error('Error obteniendo usuario:', usuarioError);
        await supabase.auth.signOut();
        return { success: false, error: 'Usuario no encontrado en el sistema' };
    }

    if (!usuario.activo) {
        await supabase.auth.signOut();
        return { success: false, error: 'Tu cuenta está desactivada. Contacta al admin.' };
    }

    const rolesValidos = ['dueno', 'admin', 'repartidor'];
    if (!rolesValidos.includes(usuario.rol)) {
        await supabase.auth.signOut();
        return { success: false, error: 'Tu cuenta no tiene un rol válido asignado' };
    }

    return {
        success: true,
        user: {
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre ?? null,
            rol: usuario.rol as 'dueno' | 'admin' | 'repartidor',
        },
    };
}

/** Server action que redirige según rol */
export async function loginWithRedirect(formData: FormData): Promise<LoginResult | void> {
    const result = await loginAction(formData);
    if (!result.success) return result;

    const role = result.user!.rol;
    if (role === 'dueno') return redirect('/dueno/reportes');
    if (role === 'admin') return redirect('/admin/tienda');
    if (role === 'repartidor') return redirect('/repartidor/ordenes-listas');

    return { success: false, error: `Rol no reconocido: ${role}` };
}
