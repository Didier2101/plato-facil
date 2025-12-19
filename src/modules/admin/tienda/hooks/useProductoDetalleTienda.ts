'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProductoFrontend } from "@/src/modules/admin/productos/types/producto";
import { useCarritoStore, IngredientePersonalizado } from "@/src/modules/admin/tienda/store/carritoStore";
import { toast } from "@/src/shared/services/toast.service";

/**
 * Hook para gestionar la lógica del modal de detalle de producto en la tienda.
 */
export function useProductoDetalleTienda(producto: ProductoFrontend, onClose: () => void) {
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState("");
    const [imageError, setImageError] = useState(false);
    const [personalizarAbierto, setPersonalizarAbierto] = useState(false);
    const [imageErrorsSugeridos, setImageErrorsSugeridos] = useState<Record<string, boolean>>({});

    const { agregarProducto } = useCarritoStore();

    // Estado inicial de ingredientes (solo los no obligatorios para personalización)
    const [ingredientesPersonalizables, setIngredientesPersonalizables] = useState<IngredientePersonalizado[]>([]);

    // Reiniciar estado cuando cambia el producto
    useEffect(() => {
        setCantidad(1);
        setNotas("");
        setPersonalizarAbierto(false);
        setImageError(false);

        const personalizables = producto.ingredientes
            ?.filter(pi => !pi.obligatorio)
            .map((pi) => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                incluido: true,
                obligatorio: false,
            })) || [];

        setIngredientesPersonalizables(personalizables);
    }, [producto]);

    const subtotal = useMemo(() => producto.precio * cantidad, [producto.precio, cantidad]);

    const toggleIngrediente = useCallback((ingredienteId: string) => {
        setIngredientesPersonalizables((prev) =>
            prev.map((ing) =>
                ing.ingrediente_id === ingredienteId
                    ? { ...ing, incluido: !ing.incluido }
                    : ing
            )
        );
    }, []);

    const handleAgregarAlCarrito = useCallback(() => {
        const ingredientesObligatorios = producto.ingredientes
            ?.filter(pi => pi.obligatorio)
            .map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente.nombre,
                incluido: true,
                obligatorio: true,
            })) || [];

        const todosLosIngredientes = [
            ...ingredientesObligatorios,
            ...ingredientesPersonalizables
        ];

        const productoId = typeof producto.id === "string" ? parseInt(producto.id, 10) : producto.id;

        agregarProducto({
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url || null,
            categoria: producto.categoria || "SIn categoría",
            cantidad,
            ingredientes_personalizados: todosLosIngredientes,
            notas: notas.trim() || undefined,
        });

        toast.success(`¡${producto.nombre} agregado!`, { duration: 1500 });
        onClose();
    }, [producto, cantidad, ingredientesPersonalizables, notas, agregarProducto, onClose]);

    const handleSetImageErrorSugerido = useCallback((id: string) => {
        setImageErrorsSugeridos(prev => ({ ...prev, [id]: true }));
    }, []);

    return {
        cantidad,
        setCantidad,
        notas,
        setNotas,
        imageError,
        setImageError,
        personalizarAbierto,
        setPersonalizarAbierto,
        ingredientesPersonalizables,
        toggleIngrediente,
        handleAgregarAlCarrito,
        subtotal,
        imageErrorsSugeridos,
        handleSetImageErrorSugerido
    };
}
