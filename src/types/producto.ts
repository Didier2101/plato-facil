// src/types/producto.ts

export interface Categoria {
    id: string;
    nombre: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

export interface Ingrediente {
    id: string;
    nombre: string;
    activo: boolean;
    created_at: string;
}

export interface ProductoIngrediente {
    id: string;
    producto_id: number;
    ingrediente_id: string;
    obligatorio: boolean;
    orden: number;
    ingrediente: Ingrediente;
}

// Para el frontend - cuando obtenemos productos
export interface ProductoFrontend {
    id: number;
    nombre: string;
    precio: number;
    imagen_url?: string | null;
    activo: boolean;
    created_at: string;
    categoria_id: string;
    categoria: string;
    descripcion?: string | null;
    ingredientes?: ProductoIngrediente[];
}

// Para ingredientes personalizados en el carrito
export interface IngredientePersonalizado {
    ingrediente_id: string;
    nombre: string;
    incluido: boolean; // true = incluir, false = quitar
    obligatorio: boolean;
}

// Para órdenes - expandido para incluir personalización
export interface ProductoOrden {
    producto_id: number;
    nombre: string;
    precio: number;
    cantidad: number;
    subtotal: number;
    // Personalización del producto
    ingredientes_personalizados?: IngredientePersonalizado[];
    notas?: string;
    personalizacion_id?: string;
}

export interface DatosCliente {
    nombre: string;
    telefono?: string;
    direccion?: string;
    notas?: string;
}

// AGREGADO: Configuración de domicilio
export interface ConfiguracionDomicilio {
    id: string;
    direccion_restaurante: string;
    latitud_restaurante: number;
    longitud_restaurante: number;
    tarifa_base: number;
    tarifa_por_km: number;
    km_gratis: number;
    km_maximo: number;
    tiempo_preparacion_min: number;
}

// AGREGADO: Cálculo de distancia
export interface CalculoDistancia {
    distancia_km: number;
    tiempo_estimado_min: number;
    costo_domicilio: number;
    dentro_cobertura: boolean;
    coordenadas_destino: {
        lat: number;
        lng: number;
    };
}

// ACTUALIZADO: OrdenData con campos de pago y geolocalización
export interface OrdenData {
    cliente: DatosCliente;
    productos: ProductoOrden[];
    subtotal: number; // AGREGADO: subtotal sin domicilio
    costo_domicilio: number; // AGREGADO: costo del domicilio
    total: number; // total = subtotal + costo_domicilio
    estado: string;
    tipo_orden: "establecimiento" | "domicilio";

    // AGREGADO: Información de pago
    metodo_pago_preferido: "efectivo" | "tarjeta" | "transferencia";
    dinero_recibido?: number; // Para pago en efectivo
    cambio_requerido?: number; // Cambio calculado
    notas_pago?: string;

    // AGREGADO: Información de geolocalización (solo para domicilio)
    latitud_entrega?: number;
    longitud_entrega?: number;
    distancia_km?: number;
    tiempo_estimado_min?: number;
}