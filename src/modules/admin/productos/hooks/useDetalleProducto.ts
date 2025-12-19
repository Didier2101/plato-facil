'use client';

import { useState, useCallback, useEffect, useMemo } from "react";
import type { ProductoFrontend, CategoriaFrontend } from "@/src/modules/admin/productos/types/producto";
import { actualizarProductoAction } from "@/src/modules/admin/productos/actions/actualizarProductoAction";
import { desactivarProductoAction } from "@/src/modules/admin/productos/actions/desactivarProductoAction";
import { obtenerIngredientesAction } from "@/src/modules/admin/productos/actions/obtenerIngredientesAction";
import { obtenerCategoriasAction } from "@/src/modules/admin/productos/actions/obtenerCategoriasAction";
import { useImageOptimizer } from "@/src/shared/hooks/useImageOptimizer";
import { toast } from "@/src/shared/services/toast.service";
import { validarPrecio, limpiarNumero } from "@/src/shared/utils/precio";

interface IngredienteDisponible {
    id: string;
    nombre: string;
    activo: boolean;
}

interface IngredienteSeleccionado {
    ingrediente_id: string;
    nombre: string;
    obligatorio: boolean;
}

interface UseDetalleProductoProps {
    producto: ProductoFrontend;
    onProductoActualizado: (producto: ProductoFrontend) => void;
    onProductoEliminado: (productoId: string) => void;
    onCerrar: () => void;
}

export function useDetalleProducto({
    producto,
    onProductoActualizado,
}: UseDetalleProductoProps) {
    const [modoEdicion, setModoEdicion] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nuevaImagen, setNuevaImagen] = useState<File | null>(null);
    const [previewImagen, setPreviewImagen] = useState<string | null>(null);

    const [ingredientesDisponibles, setIngredientesDisponibles] = useState<IngredienteDisponible[]>([]);
    const [cargandoIngredientes, setCargandoIngredientes] = useState(false);
    const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState<IngredienteSeleccionado[]>([]);

    const [categorias, setCategorias] = useState<CategoriaFrontend[]>([]);
    const [cargandoCategorias, setCargandoCategorias] = useState(false);
    const [confirmandoCambioEstado, setConfirmandoCambioEstado] = useState(false);

    const [datosEdicion, setDatosEdicion] = useState({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        activo: producto.activo,
        categoria_id: producto.categoria_id || ''
    });

    const { optimize, optimizing } = useImageOptimizer();

    const cargarIngredientesDisponibles = useCallback(async () => {
        setCargandoIngredientes(true);
        try {
            const result = await obtenerIngredientesAction();
            if (result.success && result.ingredientes) {
                setIngredientesDisponibles(result.ingredientes);
            }
        } catch (error) {
            console.error('Error cargando ingredientes:', error);
        } finally {
            setCargandoIngredientes(false);
        }
    }, []);

    const cargarCategorias = useCallback(async () => {
        setCargandoCategorias(true);
        try {
            const result = await obtenerCategoriasAction({ soloActivas: true });
            if (result.success && result.categorias) {
                setCategorias(result.categorias);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        } finally {
            setCargandoCategorias(false);
        }
    }, []);

    useEffect(() => {
        cargarIngredientesDisponibles();
        cargarCategorias();

        if (producto.ingredientes) {
            const ingredientesIniciales = producto.ingredientes.map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente?.nombre || 'Ingrediente',
                obligatorio: pi.obligatorio
            }));
            setIngredientesSeleccionados(ingredientesIniciales);
        }
    }, [producto, cargarIngredientesDisponibles, cargarCategorias]);

    const handleAgregarIngrediente = useCallback((ingrediente: IngredienteDisponible) => {
        if (ingredientesSeleccionados.some(i => i.ingrediente_id === ingrediente.id)) {
            return;
        }

        setIngredientesSeleccionados(prev => [...prev, {
            ingrediente_id: ingrediente.id,
            nombre: ingrediente.nombre,
            obligatorio: true
        }]);
    }, [ingredientesSeleccionados]);

    const handleQuitarIngrediente = useCallback((ingredienteId: string) => {
        setIngredientesSeleccionados(prev =>
            prev.filter(i => i.ingrediente_id !== ingredienteId)
        );
    }, []);

    const handleToggleObligatorio = useCallback((ingredienteId: string) => {
        setIngredientesSeleccionados(prev =>
            prev.map(i =>
                i.ingrediente_id === ingredienteId
                    ? { ...i, obligatorio: !i.obligatorio }
                    : i
            )
        );
    }, []);

    const handleGuardarCambios = useCallback(async () => {
        if (!datosEdicion.nombre.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        if (datosEdicion.precio <= 0 || !validarPrecio(datosEdicion.precio)) {
            toast.error("El precio debe ser mayor a 0");
            return;
        }

        if (!datosEdicion.categoria_id) {
            toast.error("La categoría es requerida");
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("nombre", datosEdicion.nombre.trim());
            formData.append("descripcion", datosEdicion.descripcion.trim());
            formData.append("precio", datosEdicion.precio.toString());
            formData.append("activo", datosEdicion.activo.toString());
            formData.append("categoria_id", datosEdicion.categoria_id);
            formData.append("ingredientes", JSON.stringify(ingredientesSeleccionados));

            if (nuevaImagen) {
                // 🔥 OPTIMIZAR IMAGEN ANTES DE SUBIR
                console.log('🖼️  Optimizando imagen para edición...');
                const optimizedFile = await optimize(nuevaImagen, {
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.85,
                    format: 'webp',
                });

                if (optimizedFile) {
                    formData.append("imagen", optimizedFile);
                    toast.info('Imagen optimizada correctamente');
                } else {
                    formData.append("imagen", nuevaImagen);
                }
            }

            const result = await actualizarProductoAction(String(producto.id), formData);

            if (!result.success) {
                toast.error(result.error || "No se pudo actualizar el producto");
                return;
            }

            if (result.producto) {
                onProductoActualizado(result.producto);
                toast.success("Producto actualizado correctamente");
                setModoEdicion(false);
                setNuevaImagen(null);
                setPreviewImagen(null);
            }
        } catch (error) {
            console.error('Error actualizando producto:', error);
            toast.error("No se pudo actualizar el producto");
        } finally {
            setLoading(false);
        }
    }, [datosEdicion, nuevaImagen, ingredientesSeleccionados, producto.id, onProductoActualizado, optimize]);

    const handleCambiarEstado = useCallback(async () => {
        if (!confirmandoCambioEstado) {
            setConfirmandoCambioEstado(true);
            return;
        }

        setLoading(true);
        const nuevoEstado = !producto.activo;

        try {
            const result = await desactivarProductoAction(String(producto.id), nuevoEstado);

            if (!result.success) {
                toast.error(result.error || `No se pudo ${nuevoEstado ? 'activar' : 'desactivar'} el producto`);
                setConfirmandoCambioEstado(false);
                return;
            }

            // Actualizamos el producto localmente para que el componente padre se entere
            onProductoActualizado({
                ...producto,
                activo: nuevoEstado
            });

            toast.success(`Producto ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
            setConfirmandoCambioEstado(false);

            // Si el usuario quiere que se cierre al desactivar, podemos llamar onCerrar()
            // Pero si es solo activar/desactivar, quizás mejor dejarlo abierto
            if (!nuevoEstado) {
                // onCerrar(); // Opcional
            }

        } catch (error) {
            console.error('Error cambiando estado producto:', error);
            toast.error("No se pudo cambiar el estado del producto");
            setConfirmandoCambioEstado(false);
        } finally {
            setLoading(false);
        }
    }, [producto, confirmandoCambioEstado, onProductoActualizado]);

    const handleCancelarEdicion = useCallback(() => {
        setDatosEdicion({
            nombre: producto.nombre,
            descripcion: producto.descripcion || '',
            precio: producto.precio,
            activo: producto.activo,
            categoria_id: producto.categoria_id || ''
        });

        if (producto.ingredientes) {
            const ingredientesIniciales = producto.ingredientes.map(pi => ({
                ingrediente_id: pi.ingrediente_id,
                nombre: pi.ingrediente?.nombre || 'Ingrediente',
                obligatorio: pi.obligatorio
            }));
            setIngredientesSeleccionados(ingredientesIniciales);
        }

        setNuevaImagen(null);
        setPreviewImagen(null);
        setModoEdicion(false);
    }, [producto]);

    const handleCambioImagen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Formato de imagen inválido (JPG, PNG o WEBP)");
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error("La imagen es demasiado grande (máx 5MB)");
            return;
        }

        setNuevaImagen(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImagen(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    const handleEliminarImagen = useCallback(() => {
        setNuevaImagen(null);
        setPreviewImagen(null);
    }, []);

    const handleCambioPrecio = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = e.target.value;
        const precio = limpiarNumero(valor);
        setDatosEdicion(prev => ({ ...prev, precio }));
    }, []);

    const ingredientesNoSeleccionados = useMemo(() => {
        return ingredientesDisponibles.filter(
            ing => !ingredientesSeleccionados.some(sel => sel.ingrediente_id === ing.id)
        );
    }, [ingredientesDisponibles, ingredientesSeleccionados]);

    return {
        modoEdicion,
        setModoEdicion,
        loading: loading || optimizing,
        datosEdicion,
        setDatosEdicion,
        nuevaImagen,
        previewImagen,
        ingredientesSeleccionados,
        ingredientesNoSeleccionados,
        cargandoIngredientes,
        categorias,
        cargandoCategorias,
        confirmandoCambioEstado,
        setConfirmandoCambioEstado,
        handleAgregarIngrediente,
        handleQuitarIngrediente,
        handleToggleObligatorio,
        handleGuardarCambios,
        handleCambiarEstado,
        handleCancelarEdicion,
        handleCambioImagen,
        handleEliminarImagen,
        handleCambioPrecio
    };
}
