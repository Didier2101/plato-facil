'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { obtenerProductosAction } from '@/src/modules/admin/productos/actions/obtenerProductosAction';
import { toast } from '@/src/shared/services/toast.service';
import { ProductoFrontend } from '@/src/modules/admin/productos/types/producto';

/**
 * Hook para gestionar la lógica de la tienda: carga de productos, filtros por categoría y tipo de orden.
 */
export function useTienda() {
    const [productos, setProductos] = useState<ProductoFrontend[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriaActiva, setCategoriaActiva] = useState<string>("todas");
    const [mostrarCarrito, setMostrarCarrito] = useState(false);
    const [tipoOrden, setTipoOrden] = useState<"mesa" | "para_llevar">("mesa");

    const cargarProductos = useCallback(async () => {
        try {
            setLoading(true);
            const result = await obtenerProductosAction();

            if (result.success && result.productos) {
                setProductos(result.productos.filter((p) => p.activo));
            } else {
                const errorMsg = result.error || "No se pudieron cargar los productos";
                toast.error("Error", { description: errorMsg });
            }
        } catch (error) {
            console.error("Error cargando productos:", error);
            toast.error("Error inesperado", { description: "Ocurrió un error al cargar el menú" });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    const categorias = useMemo(() => {
        return [
            { id: "todas", nombre: "Todas" },
            ...Array.from(new Set(productos.filter(p => p.categoria).map((p) => p.categoria))).map(
                (categoria) => ({
                    id: (categoria as string).toLowerCase().replace(/\s+/g, "-"),
                    nombre: categoria as string,
                })
            ),
        ];
    }, [productos]);

    const productosFiltrados = useMemo(() => {
        return categoriaActiva === "todas"
            ? productos
            : productos.filter(
                (p) => p.categoria?.toLowerCase().replace(/\s+/g, "-") === categoriaActiva
            );
    }, [productos, categoriaActiva]);

    const productosAgrupados = useMemo(() => {
        if (categoriaActiva !== "todas") return [];

        const cats = Array.from(new Set(productos.filter(p => p.categoria).map(p => p.categoria)));
        return cats.map(cat => ({
            categoria: cat as string,
            productos: productos.filter(p => p.categoria === cat)
        }));
    }, [productos, categoriaActiva]);

    return {
        productos,
        loading,
        categoriaActiva,
        setCategoriaActiva,
        mostrarCarrito,
        setMostrarCarrito,
        tipoOrden,
        setTipoOrden,
        categorias,
        productosFiltrados,
        productosAgrupados,
        refresh: cargarProductos
    };
}
