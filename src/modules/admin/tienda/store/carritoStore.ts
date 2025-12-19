// src/store/carritoStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipo para ingredientes personalizados más detallado
export interface IngredientePersonalizado {
    ingrediente_id: string;
    nombre: string;
    incluido: boolean; // true = incluir, false = quitar
    obligatorio: boolean;
}

export interface ProductoCarrito {
    id: number;
    nombre: string;
    precio: number;
    imagen_url: string | null | undefined; // Cambiado para coincidir con ProductoFrontend
    categoria: string;
    cantidad: number;
    notas?: string;
    // Mejorado: array de ingredientes con más información
    ingredientes_personalizados?: IngredientePersonalizado[];
    // ID único para distinguir mismo producto con diferentes personalizaciones
    personalizacion_id?: string;
}

interface CarritoState {
    productos: ProductoCarrito[];
    total: number;
    agregarProducto: (producto: ProductoCarrito) => void;
    actualizarCantidad: (personalizacionId: string, cantidad: number) => void;
    removerProducto: (personalizacionId: string) => void;
    limpiarCarrito: () => void;
    calcularTotal: () => void;
    // Nueva función para generar ID único
    generarPersonalizacionId: (productoId: number, ingredientes?: IngredientePersonalizado[], notas?: string) => string;
}

export const useCarritoStore = create<CarritoState>()(
    persist(
        (set, get) => ({
            productos: [],
            total: 0,

            generarPersonalizacionId: (productoId, ingredientes = [], notas = '') => {
                // Crear ID único basado en producto, ingredientes y notas
                const ingredientesStr = JSON.stringify(
                    ingredientes
                        ?.sort((a, b) => (a.ingrediente_id || '').localeCompare(b.ingrediente_id || '')) || []
                );
                const baseStr = `${productoId}-${ingredientesStr}-${notas}`;
                return btoa(baseStr).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
            },

            agregarProducto: (nuevoProducto) => {
                const { productos } = get();

                // Si no tiene personalizacion_id, generarlo
                if (!nuevoProducto.personalizacion_id) {
                    nuevoProducto.personalizacion_id = get().generarPersonalizacionId(
                        nuevoProducto.id,
                        nuevoProducto.ingredientes_personalizados,
                        nuevoProducto.notas
                    );
                }

                // Buscar si existe un producto con la misma personalización
                const productoExistente = productos.find(p =>
                    p.personalizacion_id === nuevoProducto.personalizacion_id
                );

                if (productoExistente) {
                    // Si existe, solo aumentar cantidad
                    set({
                        productos: productos.map(p =>
                            p.personalizacion_id === nuevoProducto.personalizacion_id
                                ? { ...p, cantidad: p.cantidad + nuevoProducto.cantidad }
                                : p
                        )
                    });
                } else {
                    // Si no existe, agregar como nuevo producto
                    set({
                        productos: [...productos, nuevoProducto]
                    });
                }

                get().calcularTotal();
            },

            actualizarCantidad: (personalizacionId, cantidad) => {
                if (cantidad <= 0) {
                    get().removerProducto(personalizacionId);
                    return;
                }

                set({
                    productos: get().productos.map(p =>
                        p.personalizacion_id === personalizacionId ? { ...p, cantidad } : p
                    )
                });
                get().calcularTotal();
            },

            removerProducto: (personalizacionId) => {
                set({
                    productos: get().productos.filter(p => p.personalizacion_id !== personalizacionId)
                });
                get().calcularTotal();
            },

            limpiarCarrito: () => {
                set({ productos: [], total: 0 });
            },

            calcularTotal: () => {
                const total = get().productos.reduce(
                    (sum, producto) => sum + (producto.precio * producto.cantidad),
                    0
                );
                set({ total });
            },
        }),
        {
            name: 'carrito-storage',
        }
    )
);