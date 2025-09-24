/**
 * Utilidades para el manejo y formateo de texto
 */

/**
 * Convierte la primera letra de una cadena a mayúscula
 * @param texto - La cadena de texto a formatear
 * @returns String con la primera letra en mayúscula
 */
export const capitalizarPrimeraLetra = (texto: string): string => {
    if (!texto || texto.length === 0) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

/**
 * Convierte la primera letra de cada palabra a mayúscula (Title Case)
 * @param texto - La cadena de texto a formatear
 * @returns String con cada palabra capitalizada
 */
export const capitalizarPalabras = (texto: string): string => {
    if (!texto || texto.length === 0) return texto;
    return texto
        .toLowerCase()
        .split(' ')
        .map(palabra => capitalizarPrimeraLetra(palabra))
        .join(' ');
};

/**
 * Convierte la primera letra de una cadena a mayúscula y el resto a minúscula
 * @param texto - La cadena de texto a formatear
 * @returns String con solo la primera letra en mayúscula
 */
export const capitalizarSoloPrimera = (texto: string): string => {
    if (!texto || texto.length === 0) return texto;
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

/**
 * Limpia y capitaliza un texto removiendo espacios extra
 * @param texto - La cadena de texto a limpiar y capitalizar
 * @returns String limpio y capitalizado
 */
export const limpiarYCapitalizar = (texto: string): string => {
    if (!texto || texto.length === 0) return texto;
    return capitalizarPrimeraLetra(texto.trim().replace(/\s+/g, ' '));
};

/**
 * Convierte texto a formato de nombre propio
 * @param texto - La cadena de texto a formatear
 * @returns String formateado como nombre propio
 */
export const formatearNombrePropio = (texto: string): string => {
    if (!texto || texto.length === 0) return texto;
    return texto
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(palabra => {
            // Excepciones para artículos y preposiciones comunes
            const excepciones = ['de', 'del', 'la', 'el', 'y', 'e', 'o', 'u'];
            if (excepciones.includes(palabra)) {
                return palabra;
            }
            return capitalizarPrimeraLetra(palabra);
        })
        .join(' ');
};


/**
 * Genera iniciales de un nombre
 * @param nombre - El nombre completo
 * @param cantidad - Cantidad máxima de iniciales (default: 2)
 * @returns String con las iniciales en mayúscula
 */
export const generarIniciales = (nombre: string, cantidad: number = 2): string => {
    if (!nombre || nombre.length === 0) return '';
    return nombre
        .trim()
        .split(' ')
        .slice(0, cantidad)
        .map(palabra => palabra.charAt(0).toUpperCase())
        .join('');
};


export const calcularTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const ordenFecha = new Date(fecha);
    const diffMs = ahora.getTime() - ordenFecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}m`;

    const horas = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${horas}h ${mins}m`;
};