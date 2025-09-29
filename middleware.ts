// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const pathname = req.nextUrl.pathname;

    // ✅ RUTAS PÚBLICAS: No aplicar middleware
    const publicRoutes = ['/login', '/register', '/'];
    if (publicRoutes.includes(pathname)) {
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
        return NextResponse.redirect(new URL("/login", req.url));
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
        return NextResponse.redirect(new URL("/login?error=usuario_inactivo", req.url));
    }

    // ✅ Reglas de acceso por rol
    if (pathname.startsWith("/admin") && usuario.rol !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/dueno") && usuario.rol !== "dueno") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (pathname.startsWith("/repartidor") && usuario.rol !== "repartidor") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return res;
}

// ✅ IMPORTANTE: Solo proteger rutas privadas
export const config = {
    matcher: [
        "/admin/:path*",
        "/dueno/:path*",
        "/repartidor/:path*"
    ],
};