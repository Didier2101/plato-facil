// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/src/shared/constants/app-routes";
import { ROLES } from "@/src/shared/constants/rol";
import type { Rol } from "@/src/shared/types/rol";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const pathname = req.nextUrl.pathname;

    // ✅ RUTAS PÚBLICAS: No aplicar middleware
    const publicRoutes = [
        PUBLIC_ROUTES.HOME,
        PUBLIC_ROUTES.LOGIN,
        PUBLIC_ROUTES.ESTABLECIMIENTO,
        PUBLIC_ROUTES.DOMICILIO.BASE,
        PUBLIC_ROUTES.DOMICILIO.PEDIDOS,
        PUBLIC_ROUTES.DOMICILIO.INFORMACION,
        PUBLIC_ROUTES.DOMICILIO.MIS_ORDENES,
        PUBLIC_ROUTES.UNAUTHORIZED,
    ];

    if (publicRoutes.some((route) => pathname.startsWith(route))) {
        return res;
    }

    // ✅ Crear cliente de Supabase para middleware
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        res.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    // ✅ Obtener usuario autenticado
    const { data: { user }, error } = await supabase.auth.getUser();

    // Si no hay usuario o hay error, redirigir a login
    if (error || !user) {
        return NextResponse.redirect(new URL(PUBLIC_ROUTES.LOGIN, req.url));
    }

    // ✅ Buscar el rol desde la tabla usuarios
    const { data: usuario } = await supabase
        .from("usuarios")
        .select("rol, activo")
        .eq("id", user.id)
        .single();

    if (!usuario || !usuario.activo) {
        // Cerrar sesión si usuario no existe o está inactivo
        await supabase.auth.signOut();
        return NextResponse.redirect(
            new URL(`${PUBLIC_ROUTES.LOGIN}?error=usuario_inactivo`, req.url)
        );
    }

    const userRole = usuario.rol as Rol;

    // ✅ REGLAS DE ACCESO POR ROL

    // DUEÑO tiene acceso a TODO - verificar primero
    if (userRole === ROLES.DUENO) {
        return res; // ✅ Acceso total
    }

    // Rutas exclusivas de DUEÑO
    if (
        pathname.startsWith(PRIVATE_ROUTES.DUENO.REPORTES) ||
        pathname.startsWith(PRIVATE_ROUTES.DUENO.CONFIGURACIONES) ||
        pathname.startsWith(PRIVATE_ROUTES.DUENO.USUARIOS)
    ) {
        return NextResponse.redirect(
            new URL(`${PUBLIC_ROUTES.LOGIN}?error=acceso_denegado`, req.url)
        );
    }

    // Rutas de ADMIN (caja, ordenes, productos, tienda)
    if (
        pathname.startsWith(PRIVATE_ROUTES.ADMIN.CAJA) ||
        pathname.startsWith(PRIVATE_ROUTES.ADMIN.ORDENES) ||
        pathname.startsWith(PRIVATE_ROUTES.ADMIN.PRODUCTOS) ||
        pathname.startsWith(PRIVATE_ROUTES.ADMIN.TIENDA)
    ) {
        if (userRole === ROLES.ADMIN) {
            return res; // ✅ Admin puede acceder
        }
        return NextResponse.redirect(
            new URL(`${PUBLIC_ROUTES.LOGIN}?error=acceso_denegado`, req.url)
        );
    }

    // Rutas de REPARTIDOR
    if (
        pathname.startsWith(PRIVATE_ROUTES.REPARTIDOR.ORDENES_LISTAS) ||
        pathname.startsWith(PRIVATE_ROUTES.REPARTIDOR.MIS_ENTREGAS)
    ) {
        if (userRole === ROLES.REPARTIDOR) {
            return res; // ✅ Repartidor puede acceder
        }
        return NextResponse.redirect(
            new URL(`${PUBLIC_ROUTES.LOGIN}?error=acceso_denegado`, req.url)
        );
    }

    return res;
}

// ✅ IMPORTANTE: Proteger todas las rutas privadas
export const config = {
    matcher: [
        // Todas las rutas bajo /administrativo excepto las públicas
        "/administrativo/:path*",
    ],
};