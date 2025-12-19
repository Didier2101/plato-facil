'use client';

import { useState, useCallback } from 'react';
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import { useCarritoStore } from "@/src/modules/admin/tienda/store/carritoStore";
import { toast } from "@/src/shared/services/toast.service";

/**
 * Hook para gestionar la lógica de un producto individual en la tienda.
 */
export function useProductoCard(producto: ProductoFrontend, todosLosProductos: ProductoFrontend[] = []) {
    const [imageError, setImageError] = useState(false);
    const [pilaModales, setPilaModales] = useState<ProductoFrontend[]>([]);
    const { agregarProducto } = useCarritoStore();

    const handleAgregarDirectoAlCarrito = useCallback(() => {
        const productoId = typeof producto.id === 'string' ? parseInt(producto.id, 10) : producto.id;

        const productoCarrito = {
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url || null,
            categoria: producto.categoria || "General",
            cantidad: 1,
            ingredientes_personalizados: producto.ingredientes?.map((pi) => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                incluido: true,
                obligatorio: pi.obligatorio,
            })) || [],
            notas: undefined,
        };

        agregarProducto(productoCarrito);
        toast.success(`¡${producto.nombre} agregado!`, { duration: 1500 });
    }, [producto, agregarProducto]);


    const obtenerProductosSugeridos = useCallback((productoBase: ProductoFrontend): ProductoFrontend[] => {
        if (!todosLosProductos.length) return [];

        const mismaCategoria = todosLosProductos.filter(
            p => p.categoria === productoBase.categoria && p.id !== productoBase.id && p.activo
        );

        const otrasCategoria = todosLosProductos.filter(
            p => p.categoria !== productoBase.categoria && p.id !== productoBase.id && p.activo
        );

        return [...mismaCategoria, ...otrasCategoria]
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);
    }, [todosLosProductos]);

    const abrirModal = useCallback(() => {
        setPilaModales([producto]);
    }, [producto]);

    const agregarProductoAPila = useCallback((productoNuevo: ProductoFrontend) => {
        setPilaModales(prev => [...prev, productoNuevo]);
    }, []);

    const cerrarUltimoModal = useCallback(() => {
        setPilaModales(prev => prev.slice(0, -1));
    }, []);

    return {
        imageError,
        setImageError,
        pilaModales,
        handleAgregarDirectoAlCarrito,
        obtenerProductosSugeridos,
        abrirModal,
        agregarProductoAPila,
        cerrarUltimoModal
    };
}