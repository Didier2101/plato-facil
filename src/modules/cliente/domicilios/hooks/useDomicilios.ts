'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { obtenerProductosAction } from "@/src/modules/admin/productos/actions/obtenerProductosAction";
import { obtenerConfiguracionRestaurante } from "@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions";
import { toast } from "@/src/shared/services/toast.service";
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import type { ConfiguracionRestaurante } from "@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions";

/**
 * Hook para gestionar el catálogo de productos y estado de disponibilidad en Domicilios.
 */
export function useDomicilios() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [configuracion, setConfiguracion] = useState<ConfiguracionRestaurante | null>(null);
    const [loading, setLoading] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [transitionDirection, setTransitionDirection] = useState<"left" | "right" | "">("");
    const [prevCategoria, setPrevCategoria] = useState<string>("todas");

    const categorias = useMemo(() => [
        { id: "todas", nombre: "Todas" },
        ...Array.from(new Set(productos.map(p => p.categoria || "General"))).map(categoria => ({
            id: categoria.toLowerCase().replace(/\s+/g, "-"),
            nombre: categoria
        }))
    ], [productos]);

    const productosFiltrados = useMemo(() =>
        categoriaActiva === "todas"
            ? productos
            : productos.filter(p => (p.categoria || "General").toLowerCase().replace(/\s+/g, '-') === categoriaActiva)
        , [productos, categoriaActiva]);

    const productosAgrupados = useMemo(() =>
        categoriaActiva === "todas"
            ? Array.from(new Set(productos.map(p => p.categoria || "General"))).map(cat => ({
                categoria: cat,
                productos: productos.filter(p => (p.categoria || "General") === cat)
            }))
            : []
        , [productos, categoriaActiva]);


    const cambiarCategoria = useCallback((nuevaCategoria: string) => {
        if (nuevaCategoria === categoriaActiva) return;

        const currentIndex = categorias.findIndex(cat => cat.id === categoriaActiva);
        const newIndex = categorias.findIndex(cat => cat.id === nuevaCategoria);
        const direction = newIndex > currentIndex ? "left" : "right";

        setTransitionDirection(direction);
        setPrevCategoria(categoriaActiva);
        setCategoriaActiva(nuevaCategoria);

        setTimeout(() => setTransitionDirection(""), 300);
    }, [categoriaActiva, categorias]);

    const verificarHorario = useCallback((config: ConfiguracionRestaurante) => {
        if (!config.hora_apertura || !config.hora_cierre) return { abierto: true, mensaje: "" };

        const ahora = new Date();
        const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
        const [aperturaH, aperturaM] = config.hora_apertura.split(':').map(Number);
        const [cierreH, cierreM] = config.hora_cierre.split(':').map(Number);

        const apertura = aperturaH * 60 + aperturaM;
        const cierre = cierreH * 60 + cierreM;
        const abierto = horaActual >= apertura && horaActual <= cierre;

        return {
            abierto,
            mensaje: abierto ? "" : `Horario de atención: ${config.hora_apertura} - ${config.hora_cierre}`
        };
    }, []);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                const [configResult, productsResult] = await Promise.all([
                    obtenerConfiguracionRestaurante(),
                    obtenerProductosAction()
                ]);

                if (configResult.success) setConfiguracion(configResult.configuracion || null);

                if (productsResult.success) {
                    setProductos(productsResult.productos?.filter(p => p.activo) || []);
                } else {
                    toast.error("Error", { description: productsResult.error || "No se pudieron cargar los productos" });
                }
            } catch (error) {
                console.error("Error cargando datos domicilios:", error);
                toast.error("Error", { description: "Error inesperado al cargar datos" });
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const servicioDisponible = configuracion?.domicilio_activo ?? true;
    const horarioInfo = useMemo(() =>
        configuracion ? verificarHorario(configuracion) : { abierto: true, mensaje: "" }
        , [configuracion, verificarHorario]);

    return {
        productos,
        configuracion,
        loading,
        categoriaActiva,
        mostrarCarrito,
        setMostrarCarrito,
        transitionDirection,
        prevCategoria,
        categorias,
        productosFiltrados,
        productosAgrupados,
        cambiarCategoria,
        servicioDisponible,
        horarioInfo
    };
}

