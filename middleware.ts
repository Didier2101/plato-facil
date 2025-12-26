// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { APP_ROUTES, PUBLIC_ROUTES } from "@/src/shared/constants/app-routes";
import { ROLES } from "@/src/shared/constants/rol";
import type { Rol } from "@/src/shared/types/rol";

const { puedeAccederRuta } = APP_ROUTES;

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
    if (pathname.startsWith("/administrativo")) {
        // DUEÑO tiene acceso a TODO
        if (userRole === ROLES.DUENO) {
            return res;
        }

        // Verificar si el rol tiene permiso para la ruta específica
        if (!puedeAccederRuta(userRole, pathname)) {
            return NextResponse.redirect(
                new URL(`${PUBLIC_ROUTES.LOGIN}?error=acceso_denegado`, req.url)
            );
        }
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