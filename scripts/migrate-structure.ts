import * as fs from 'fs';
import * as path from 'path';

/**
 * Script de migración automática para reorganizar la estructura del proyecto
 * Ejecutar con: npx tsx scripts/migrate-structure.ts
 */

interface MigrationRule {
    from: string;
    to: string;
    type: 'file' | 'folder';
}

const BASE_PATH = process.cwd();
const SRC_PATH = path.join(BASE_PATH, 'src');

// Definición de reglas de migración
const migrationRules: MigrationRule[] = [
    // ============================================
    // AUTH MODULE
    // ============================================
    { from: 'src/actions/login/auth.ts', to: 'src/modules/auth/actions/auth.ts', type: 'file' },
    { from: 'src/actions/login/loginActions.ts', to: 'src/modules/auth/actions/loginActions.ts', type: 'file' },
    { from: 'src/components/auth/Login.tsx', to: 'src/modules/auth/components/Login.tsx', type: 'file' },
    { from: 'src/components/auth/LogoutButton.tsx', to: 'src/modules/auth/components/LogoutButton.tsx', type: 'file' },
    { from: 'src/hooks/useLogin.ts', to: 'src/modules/auth/hooks/useLogin.ts', type: 'file' },
    { from: 'src/types/auth.ts', to: 'src/modules/auth/types/auth.ts', type: 'file' },
    { from: 'src/schemas/auth.ts', to: 'src/modules/auth/schemas/auth.ts', type: 'file' },

    // ============================================
    // ADMIN MODULE - CAJA
    // ============================================
    { from: 'src/actions/cobrarOrdenAction.ts', to: 'src/modules/admin/caja/actions/cobrarOrdenAction.ts', type: 'file' },
    { from: 'src/actions/registrarPropinaAction.ts', to: 'src/modules/admin/caja/actions/registrarPropinaAction.ts', type: 'file' },
    { from: 'src/components/admin/caja/CajaLista.tsx', to: 'src/modules/admin/caja/components/CajaLista.tsx', type: 'file' },
    { from: 'src/components/admin/caja/PanelCobro.tsx', to: 'src/modules/admin/caja/components/PanelCobro.tsx', type: 'file' },
    { from: 'src/components/PanelCobro/components/BotonConfirmarCobro.tsx', to: 'src/modules/admin/caja/components/BotonConfirmarCobro.tsx', type: 'file' },
    { from: 'src/components/PanelCobro/components/ResumenTotales.tsx', to: 'src/modules/admin/caja/components/ResumenTotales.tsx', type: 'file' },
    { from: 'src/components/PanelCobro/components/SelectorComprobante.tsx', to: 'src/modules/admin/caja/components/SelectorComprobante.tsx', type: 'file' },
    { from: 'src/components/PanelCobro/components/SelectorMetodoPago.tsx', to: 'src/modules/admin/caja/components/SelectorMetodoPago.tsx', type: 'file' },
    { from: 'src/components/PanelCobro/components/SelectorPropina.tsx', to: 'src/modules/admin/caja/components/SelectorPropina.tsx', type: 'file' },
    { from: 'src/components/PanelCobro/hooks/useCobroProcess.ts', to: 'src/modules/admin/caja/hooks/useCobroProcess.ts', type: 'file' },
    { from: 'src/components/PanelCobro/hooks/useFacturacionLogic.ts', to: 'src/modules/admin/caja/hooks/useFacturacionLogic.ts', type: 'file' },
    { from: 'src/components/PanelCobro/hooks/usePropinaLogic.ts', to: 'src/modules/admin/caja/hooks/usePropinaLogic.ts', type: 'file' },
    { from: 'src/components/PanelCobro/types/cobro.ts', to: 'src/modules/admin/caja/types/cobro.ts', type: 'file' },
    { from: 'src/components/PanelCobro/utils/calculosCobro.ts', to: 'src/modules/admin/caja/utils/calculosCobro.ts', type: 'file' },
    { from: 'src/components/PanelCobro/utils/validacionesCobro.ts', to: 'src/modules/admin/caja/utils/validacionesCobro.ts', type: 'file' },
    { from: 'src/components/PanelCobro/constants/cobro.ts', to: 'src/modules/admin/caja/constants/cobro.ts', type: 'file' },

    // ============================================
    // ADMIN MODULE - ORDENES
    // ============================================
    { from: 'src/actions/obtenerOrdenesAction.ts', to: 'src/modules/admin/ordenes/actions/obtenerOrdenesAction.ts', type: 'file' },
    { from: 'src/actions/crearOrdenAction.ts', to: 'src/modules/admin/ordenes/actions/crearOrdenAction.ts', type: 'file' },
    { from: 'src/actions/actualizarEstadoOrdenAction.ts', to: 'src/modules/admin/ordenes/actions/actualizarEstadoOrdenAction.ts', type: 'file' },
    { from: 'src/actions/eliminarOrdenAction.ts', to: 'src/modules/admin/ordenes/actions/eliminarOrdenAction.ts', type: 'file' },
    { from: 'src/actions/buscarOrdenPorTelefonoAction.ts', to: 'src/modules/admin/ordenes/actions/buscarOrdenPorTelefonoAction.ts', type: 'file' },
    { from: 'src/components/admin/ordenes/Ordenes.tsx', to: 'src/modules/admin/ordenes/components/Ordenes.tsx', type: 'file' },
    { from: 'src/components/admin/ordenes/OrdenCard.tsx', to: 'src/modules/admin/ordenes/components/OrdenCard.tsx', type: 'file' },
    { from: 'src/types/orden.ts', to: 'src/modules/admin/ordenes/types/orden.ts', type: 'file' },

    // ============================================
    // ADMIN MODULE - PRODUCTOS
    // ============================================
    { from: 'src/actions/obtenerProductosAction.ts', to: 'src/modules/admin/productos/actions/obtenerProductosAction.ts', type: 'file' },
    { from: 'src/actions/crearProductoAction.ts', to: 'src/modules/admin/productos/actions/crearProductoAction.ts', type: 'file' },
    { from: 'src/actions/actualizarProductoAction.ts', to: 'src/modules/admin/productos/actions/actualizarProductoAction.ts', type: 'file' },
    { from: 'src/actions/desactivarProductoAction.ts', to: 'src/modules/admin/productos/actions/desactivarProductoAction.ts', type: 'file' },
    { from: 'src/components/admin/productos/ProductosLista.tsx', to: 'src/modules/admin/productos/components/ProductosLista.tsx', type: 'file' },
    { from: 'src/components/admin/productos/DetalleProducto.tsx', to: 'src/modules/admin/productos/components/DetalleProducto.tsx', type: 'file' },
    { from: 'src/components/admin/productos/FormAgregarProducto.tsx', to: 'src/modules/admin/productos/components/FormAgregarProducto.tsx', type: 'file' },
    { from: 'src/types/producto.ts', to: 'src/modules/admin/productos/types/producto.ts', type: 'file' },

    // ============================================
    // ADMIN MODULE - TIENDA
    // ============================================
    { from: 'src/actions/categoriasActions.ts', to: 'src/modules/admin/tienda/actions/categoriasActions.ts', type: 'file' },
    { from: 'src/actions/ingredientesActions.ts', to: 'src/modules/admin/tienda/actions/ingredientesActions.ts', type: 'file' },
    { from: 'src/actions/obtenerIngredientesAction.ts', to: 'src/modules/admin/tienda/actions/obtenerIngredientesAction.ts', type: 'file' },
    { from: 'src/components/tienda/TiendaProductos.tsx', to: 'src/modules/admin/tienda/components/TiendaProductos.tsx', type: 'file' },
    { from: 'src/components/tienda/ProductoCard.tsx', to: 'src/modules/admin/tienda/components/ProductoCard.tsx', type: 'file' },
    { from: 'src/components/tienda/ProductoDetalleModal.tsx', to: 'src/modules/admin/tienda/components/ProductoDetalleModal.tsx', type: 'file' },
    { from: 'src/components/tienda/CarritoResumen.tsx', to: 'src/modules/admin/tienda/components/CarritoResumen.tsx', type: 'file' },
    { from: 'src/store/carritoStore.ts', to: 'src/modules/admin/tienda/store/carritoStore.ts', type: 'file' },

    // ============================================
    // DUENO MODULE - USUARIOS
    // ============================================
    { from: 'src/actions/dueno/obtenerUsuariosAction.ts', to: 'src/modules/dueno/usuarios/actions/obtenerUsuariosAction.ts', type: 'file' },
    { from: 'src/actions/dueno/crearUsuarioAction.ts', to: 'src/modules/dueno/usuarios/actions/crearUsuarioAction.ts', type: 'file' },
    { from: 'src/actions/dueno/editarUsuarioAction.ts', to: 'src/modules/dueno/usuarios/actions/editarUsuarioAction.ts', type: 'file' },
    { from: 'src/actions/dueno/toggleUsuarioAction.ts', to: 'src/modules/dueno/usuarios/actions/toggleUsuarioAction.ts', type: 'file' },
    { from: 'src/components/dueno/Usuarios.tsx', to: 'src/modules/dueno/usuarios/components/Usuarios.tsx', type: 'file' },
    { from: 'src/components/dueno/FormAgregarUsuario.tsx', to: 'src/modules/dueno/usuarios/components/FormAgregarUsuario.tsx', type: 'file' },

    // ============================================
    // DUENO MODULE - REPORTES
    // ============================================
    { from: 'src/actions/dueno/obtenerReporteAvanzadoAction.ts', to: 'src/modules/dueno/reportes/actions/obtenerReporteAvanzadoAction.ts', type: 'file' },
    { from: 'src/components/dueno/ReportesAvanzadosComponent.tsx', to: 'src/modules/dueno/reportes/components/ReportesAvanzadosComponent.tsx', type: 'file' },
    { from: 'src/types/reportes.ts', to: 'src/modules/dueno/reportes/types/reportes.ts', type: 'file' },

    // ============================================
    // DUENO MODULE - CONFIGURACIONES
    // ============================================
    { from: 'src/actions/dueno/configuracionRestauranteActions.ts', to: 'src/modules/dueno/configuraciones/actions/configuracionRestauranteActions.ts', type: 'file' },
    { from: 'src/components/dueno/Configuraciones.tsx', to: 'src/modules/dueno/configuraciones/components/Configuraciones.tsx', type: 'file' },

    // ============================================
    // REPARTIDOR MODULE - ENTREGAS
    // ============================================
    { from: 'src/actions/repartidor/obtenerEntregasRepartidorAction.ts', to: 'src/modules/repartidor/entregas/actions/obtenerEntregasRepartidorAction.ts', type: 'file' },
    { from: 'src/actions/repartidor/obtenerMisDomiciliosAction.ts', to: 'src/modules/repartidor/entregas/actions/obtenerMisDomiciliosAction.ts', type: 'file' },
    { from: 'src/components/domiciliario/DomiciliarioPanel.tsx', to: 'src/modules/repartidor/entregas/components/DomiciliarioPanel.tsx', type: 'file' },
    { from: 'src/components/domiciliario/MisDomiciliosComponent.tsx', to: 'src/modules/repartidor/entregas/components/MisDomiciliosComponent.tsx', type: 'file' },

    // ============================================
    // REPARTIDOR MODULE - ORDENES LISTAS
    // ============================================
    { from: 'src/actions/obtenerOrdenesListasAction.ts', to: 'src/modules/repartidor/ordenes-listas/actions/obtenerOrdenesListasAction.ts', type: 'file' },

    // ============================================
    // CLIENTE MODULE - DOMICILIOS
    // ============================================
    { from: 'src/actions/domicilio/clienteDomicilioAction.ts', to: 'src/modules/cliente/domicilios/actions/clienteDomicilioAction.ts', type: 'file' },
    { from: 'src/actions/calculoDomicilioAction.ts', to: 'src/modules/cliente/domicilios/actions/calculoDomicilioAction.ts', type: 'file' },
    { from: 'src/actions/guardarClienteAction.ts', to: 'src/modules/cliente/domicilios/actions/guardarClienteAction.ts', type: 'file' },
    { from: 'src/actions/obtenerOrdenesDomicilioAction.ts', to: 'src/modules/cliente/domicilios/actions/obtenerOrdenesDomicilioAction.ts', type: 'file' },
    { from: 'src/components/cliente-domicilio/Domicilios.tsx', to: 'src/modules/cliente/domicilios/components/Domicilios.tsx', type: 'file' },
    { from: 'src/components/domicilio/CalculadorDomicilio.tsx', to: 'src/modules/cliente/domicilios/components/CalculadorDomicilio.tsx', type: 'file' },
    { from: 'src/components/domicilio/MapaUbicacion.tsx', to: 'src/modules/cliente/domicilios/components/MapaUbicacion.tsx', type: 'file' },
    { from: 'src/components/cliente-domicilio/ModalDatosCliente.tsx', to: 'src/modules/cliente/domicilios/components/ModalDatosCliente.tsx', type: 'file' },
    { from: 'src/components/domicilio/InformacionRestaurante.tsx', to: 'src/modules/cliente/domicilios/components/InformacionRestaurante.tsx', type: 'file' },
    { from: 'src/hooks/useDomicilioCalculator.ts', to: 'src/modules/cliente/domicilios/hooks/useDomicilioCalculator.ts', type: 'file' },
    { from: 'src/store/clienteStore.ts', to: 'src/modules/cliente/domicilios/store/clienteStore.ts', type: 'file' },
    { from: 'src/types/cliente.ts', to: 'src/modules/cliente/domicilios/types/cliente.ts', type: 'file' },
    { from: 'src/types/domicilios.ts', to: 'src/modules/cliente/domicilios/types/domicilios.ts', type: 'file' },

    // ============================================
    // CLIENTE MODULE - MIS ORDENES
    // ============================================
    { from: 'src/components/cliente-domicilio/MisOrdenes.tsx', to: 'src/modules/cliente/mis-ordenes/components/MisOrdenes.tsx', type: 'file' },

    // ============================================
    // LANDING MODULE
    // ============================================
    { from: 'src/components/landing/RestaurantLandingPage.tsx', to: 'src/modules/landing/components/RestaurantLandingPage.tsx', type: 'file' },
    { from: 'src/components/landing/Header.tsx', to: 'src/modules/landing/components/Header.tsx', type: 'file' },
    { from: 'src/components/landing/Footer.tsx', to: 'src/modules/landing/components/Footer.tsx', type: 'file' },
    { from: 'src/components/landing/HeroSection.tsx', to: 'src/modules/landing/components/HeroSection.tsx', type: 'file' },
    { from: 'src/components/landing/MenuSection.tsx', to: 'src/modules/landing/components/MenuSection.tsx', type: 'file' },
    { from: 'src/components/landing/InfoSection.tsx', to: 'src/modules/landing/components/InfoSection.tsx', type: 'file' },
    { from: 'src/components/landing/LocationSection.tsx', to: 'src/modules/landing/components/LocationSection.tsx', type: 'file' },

    // ============================================
    // SHARED - COMPONENTS
    // ============================================
    { from: 'src/components/ui/Loading.tsx', to: 'src/shared/components/ui/Loading.tsx', type: 'file' },
    { from: 'src/components/ui/Logo.tsx', to: 'src/shared/components/ui/Logo.tsx', type: 'file' },
    { from: 'src/components/ui/CookieBanner.tsx', to: 'src/shared/components/ui/CookieBanner.tsx', type: 'file' },
    { from: 'src/components/Paginacion.tsx', to: 'src/shared/components/Paginacion.tsx', type: 'file' },
    { from: 'src/components/NotFound.tsx', to: 'src/shared/components/NotFound.tsx', type: 'file' },
    { from: 'src/components/Unauthorized.tsx', to: 'src/shared/components/Unauthorized.tsx', type: 'file' },
    { from: 'src/components/SupabaseProvider.tsx', to: 'src/shared/components/SupabaseProvider.tsx', type: 'file' },

    // ============================================
    // SHARED - LAYOUTS
    // ============================================
    { from: 'src/components/layouts/AdminLayoutClient.tsx', to: 'src/shared/layouts/AdminLayoutClient.tsx', type: 'file' },
    { from: 'src/components/layouts/DuenoLayoutClient.tsx', to: 'src/shared/layouts/DuenoLayoutClient.tsx', type: 'file' },
    { from: 'src/components/layouts/RepartidorLayoutClient.tsx', to: 'src/shared/layouts/RepartidorLayoutClient.tsx', type: 'file' },
    { from: 'src/components/layouts/DomiciliosLayoutClient.tsx', to: 'src/shared/layouts/DomiciliosLayoutClient.tsx', type: 'file' },

    // ============================================
    // SHARED - STORE
    // ============================================
    { from: 'src/store/useUserStore.ts', to: 'src/shared/store/useUserStore.ts', type: 'file' },
    { from: 'src/store/cookieConsentStore.ts', to: 'src/shared/store/cookieConsentStore.ts', type: 'file' },

    // ============================================
    // SHARED - UTILS
    // ============================================
    { from: 'src/utils/precio.ts', to: 'src/shared/utils/precio.ts', type: 'file' },
    { from: 'src/utils/texto.ts', to: 'src/shared/utils/texto.ts', type: 'file' },

    // ============================================
    // SHARED - CONSTANTS
    // ============================================
    { from: 'src/constants/app-routes.ts', to: 'src/shared/constants/app-routes.ts', type: 'file' },

    // ============================================
    // SHARED - TYPES
    // ============================================
    { from: 'src/types/database.ts', to: 'src/shared/types/database.ts', type: 'file' },
];

// Funciones auxiliares
function ensureDirectoryExists(filePath: string): void {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log(`📁 Carpeta creada: ${directory}`);
    }
}

function moveFile(from: string, to: string): boolean {
    const fromPath = path.join(BASE_PATH, from);
    const toPath = path.join(BASE_PATH, to);

    if (!fs.existsSync(fromPath)) {
        console.log(`⚠️  No encontrado: ${from}`);
        return false;
    }

    try {
        ensureDirectoryExists(toPath);
        fs.renameSync(fromPath, toPath);
        console.log(`✅ Movido: ${from} → ${to}`);
        return true;
    } catch (error) {
        console.error(`❌ Error moviendo ${from}:`, error);
        return false;
    }
}

function cleanEmptyDirectories(directory: string): void {
    if (!fs.existsSync(directory)) return;

    const items = fs.readdirSync(directory);

    if (items.length === 0) {
        fs.rmdirSync(directory);
        console.log(`🗑️  Eliminada carpeta vacía: ${directory}`);

        // Recursivamente limpiar carpeta padre si quedó vacía
        const parentDir = path.dirname(directory);
        if (parentDir !== SRC_PATH) {
            cleanEmptyDirectories(parentDir);
        }
    } else {
        // Revisar subdirectorios
        items.forEach(item => {
            const itemPath = path.join(directory, item);
            if (fs.statSync(itemPath).isDirectory()) {
                cleanEmptyDirectories(itemPath);
            }
        });
    }
}

// Función principal de migración
async function migrate(): Promise<void> {
    console.log('🚀 Iniciando migración de estructura...\n');

    let movedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;

    // Ejecutar migraciones
    for (const rule of migrationRules) {
        const success = moveFile(rule.from, rule.to);

        if (success) {
            movedCount++;
        } else {
            const fromPath = path.join(BASE_PATH, rule.from);
            if (!fs.existsSync(fromPath)) {
                notFoundCount++;
            } else {
                errorCount++;
            }
        }
    }

    console.log('\n📊 Limpiando carpetas vacías...\n');

    // Limpiar carpetas vacías de las ubicaciones antiguas
    const oldDirs = [
        'src/actions',
        'src/components',
        'src/hooks',
        'src/types',
        'src/store',
        'src/utils',
        'src/constants',
        'src/schemas',
    ];

    oldDirs.forEach(dir => {
        const fullPath = path.join(BASE_PATH, dir);
        if (fs.existsSync(fullPath)) {
            cleanEmptyDirectories(fullPath);
        }
    });

    // Resumen
    console.log('\n' + '='.repeat(60));
    console.log('📈 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(60));
    console.log(`✅ Archivos movidos exitosamente: ${movedCount}`);
    console.log(`⚠️  Archivos no encontrados: ${notFoundCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📦 Total de reglas: ${migrationRules.length}`);
    console.log('='.repeat(60));

    if (movedCount > 0) {
        console.log('\n✨ Migración completada!\n');
        console.log('📝 PRÓXIMOS PASOS:');
        console.log('1. Actualizar imports en los archivos');
        console.log('2. Ejecutar: npx tsx scripts/update-imports.ts');
        console.log('3. Verificar que todo compile: npm run build');
        console.log('4. Probar la aplicación: npm run dev\n');
    }
}

// Ejecutar migración
migrate().catch(console.error);