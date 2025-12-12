import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para actualizar todos los imports después de la migración
 * Ejecutar con: npx tsx scripts/update-imports.ts
 */

interface ImportMapping {
    old: RegExp;
    new: string;
    description: string;
}

const BASE_PATH = process.cwd();

// Mapeo de imports antiguos a nuevos
const importMappings: ImportMapping[] = [
    // AUTH
    {
        old: /@\/src\/actions\/login\/(auth|loginActions)/g,
        new: '@/src/modules/auth/actions/$1',
        description: 'Auth actions'
    },
    {
        old: /@\/src\/components\/auth\/(Login|LogoutButton)/g,
        new: '@/src/modules/auth/components/$1',
        description: 'Auth components'
    },
    {
        old: /@\/src\/hooks\/useLogin/g,
        new: '@/src/modules/auth/hooks/useLogin',
        description: 'Auth hooks'
    },
    {
        old: /@\/src\/types\/auth/g,
        new: '@/src/modules/auth/types/auth',
        description: 'Auth types'
    },
    {
        old: /@\/src\/schemas\/auth/g,
        new: '@/src/modules/auth/schemas/auth',
        description: 'Auth schemas'
    },

    // ADMIN - CAJA
    {
        old: /@\/src\/actions\/(cobrarOrdenAction|registrarPropinaAction)/g,
        new: '@/src/modules/admin/caja/actions/$1',
        description: 'Caja actions'
    },
    {
        old: /@\/src\/components\/admin\/caja\/(CajaLista|PanelCobro)/g,
        new: '@/src/modules/admin/caja/components/$1',
        description: 'Caja components'
    },
    {
        old: /@\/src\/components\/PanelCobro\/components\/(BotonConfirmarCobro|ResumenTotales|SelectorComprobante|SelectorMetodoPago|SelectorPropina)/g,
        new: '@/src/modules/admin/caja/components/$1',
        description: 'PanelCobro components'
    },
    {
        old: /@\/src\/components\/PanelCobro\/hooks\/(useCobroProcess|useFacturacionLogic|usePropinaLogic)/g,
        new: '@/src/modules/admin/caja/hooks/$1',
        description: 'Caja hooks'
    },
    {
        old: /@\/src\/components\/PanelCobro\/types\/cobro/g,
        new: '@/src/modules/admin/caja/types/cobro',
        description: 'Caja types'
    },
    {
        old: /@\/src\/components\/PanelCobro\/utils\/(calculosCobro|validacionesCobro)/g,
        new: '@/src/modules/admin/caja/utils/$1',
        description: 'Caja utils'
    },
    {
        old: /@\/src\/components\/PanelCobro\/constants\/cobro/g,
        new: '@/src/modules/admin/caja/constants/cobro',
        description: 'Caja constants'
    },

    // ADMIN - ORDENES
    {
        old: /@\/src\/actions\/(obtenerOrdenesAction|crearOrdenAction|actualizarEstadoOrdenAction|eliminarOrdenAction|buscarOrdenPorTelefonoAction)/g,
        new: '@/src/modules/admin/ordenes/actions/$1',
        description: 'Ordenes actions'
    },
    {
        old: /@\/src\/components\/admin\/ordenes\/(Ordenes|OrdenCard)/g,
        new: '@/src/modules/admin/ordenes/components/$1',
        description: 'Ordenes components'
    },
    {
        old: /@\/src\/types\/orden/g,
        new: '@/src/modules/admin/ordenes/types/orden',
        description: 'Ordenes types'
    },

    // ADMIN - PRODUCTOS
    {
        old: /@\/src\/actions\/(obtenerProductosAction|crearProductoAction|actualizarProductoAction|desactivarProductoAction)/g,
        new: '@/src/modules/admin/productos/actions/$1',
        description: 'Productos actions'
    },
    {
        old: /@\/src\/components\/admin\/productos\/(ProductosLista|DetalleProducto|FormAgregarProducto)/g,
        new: '@/src/modules/admin/productos/components/$1',
        description: 'Productos components'
    },
    {
        old: /@\/src\/types\/producto/g,
        new: '@/src/modules/admin/productos/types/producto',
        description: 'Productos types'
    },

    // ADMIN - TIENDA
    {
        old: /@\/src\/actions\/(categoriasActions|ingredientesActions|obtenerIngredientesAction)/g,
        new: '@/src/modules/admin/tienda/actions/$1',
        description: 'Tienda actions'
    },
    {
        old: /@\/src\/components\/tienda\/(TiendaProductos|ProductoCard|ProductoDetalleModal|CarritoResumen)/g,
        new: '@/src/modules/admin/tienda/components/$1',
        description: 'Tienda components'
    },
    {
        old: /@\/src\/store\/carritoStore/g,
        new: '@/src/modules/admin/tienda/store/carritoStore',
        description: 'Carrito store'
    },

    // DUENO - USUARIOS
    {
        old: /@\/src\/actions\/dueno\/(obtenerUsuariosAction|crearUsuarioAction|editarUsuarioAction|toggleUsuarioAction)/g,
        new: '@/src/modules/dueno/usuarios/actions/$1',
        description: 'Usuarios actions'
    },
    {
        old: /@\/src\/components\/dueno\/(Usuarios|FormAgregarUsuario)/g,
        new: '@/src/modules/dueno/usuarios/components/$1',
        description: 'Usuarios components'
    },

    // DUENO - REPORTES
    {
        old: /@\/src\/actions\/dueno\/obtenerReporteAvanzadoAction/g,
        new: '@/src/modules/dueno/reportes/actions/obtenerReporteAvanzadoAction',
        description: 'Reportes actions'
    },
    {
        old: /@\/src\/components\/dueno\/ReportesAvanzadosComponent/g,
        new: '@/src/modules/dueno/reportes/components/ReportesAvanzadosComponent',
        description: 'Reportes components'
    },
    {
        old: /@\/src\/types\/reportes/g,
        new: '@/src/modules/dueno/reportes/types/reportes',
        description: 'Reportes types'
    },

    // DUENO - CONFIGURACIONES
    {
        old: /@\/src\/actions\/dueno\/configuracionRestauranteActions/g,
        new: '@/src/modules/dueno/configuraciones/actions/configuracionRestauranteActions',
        description: 'Configuraciones actions'
    },
    {
        old: /@\/src\/components\/dueno\/Configuraciones/g,
        new: '@/src/modules/dueno/configuraciones/components/Configuraciones',
        description: 'Configuraciones components'
    },

    // REPARTIDOR - ENTREGAS
    {
        old: /@\/src\/actions\/repartidor\/(obtenerEntregasRepartidorAction|obtenerMisDomiciliosAction)/g,
        new: '@/src/modules/repartidor/entregas/actions/$1',
        description: 'Entregas actions'
    },
    {
        old: /@\/src\/components\/domiciliario\/(DomiciliarioPanel|MisDomiciliosComponent)/g,
        new: '@/src/modules/repartidor/entregas/components/$1',
        description: 'Entregas components'
    },

    // REPARTIDOR - ORDENES LISTAS
    {
        old: /@\/src\/actions\/obtenerOrdenesListasAction/g,
        new: '@/src/modules/repartidor/ordenes-listas/actions/obtenerOrdenesListasAction',
        description: 'Ordenes listas actions'
    },

    // CLIENTE - DOMICILIOS
    {
        old: /@\/src\/actions\/domicilio\/clienteDomicilioAction/g,
        new: '@/src/modules/cliente/domicilios/actions/clienteDomicilioAction',
        description: 'Cliente domicilio actions'
    },
    {
        old: /@\/src\/actions\/(calculoDomicilioAction|guardarClienteAction|obtenerOrdenesDomicilioAction)/g,
        new: '@/src/modules/cliente/domicilios/actions/$1',
        description: 'Domicilios actions'
    },
    {
        old: /@\/src\/components\/cliente-domicilio\/(Domicilios|ModalDatosCliente)/g,
        new: '@/src/modules/cliente/domicilios/components/$1',
        description: 'Cliente domicilio components'
    },
    {
        old: /@\/src\/components\/domicilio\/(CalculadorDomicilio|MapaUbicacion|InformacionRestaurante)/g,
        new: '@/src/modules/cliente/domicilios/components/$1',
        description: 'Domicilio components'
    },
    {
        old: /@\/src\/hooks\/useDomicilioCalculator/g,
        new: '@/src/modules/cliente/domicilios/hooks/useDomicilioCalculator',
        description: 'Domicilio hooks'
    },
    {
        old: /@\/src\/store\/clienteStore/g,
        new: '@/src/modules/cliente/domicilios/store/clienteStore',
        description: 'Cliente store'
    },
    {
        old: /@\/src\/types\/(cliente|domicilios)/g,
        new: '@/src/modules/cliente/domicilios/types/$1',
        description: 'Cliente types'
    },

    // CLIENTE - MIS ORDENES
    {
        old: /@\/src\/components\/cliente-domicilio\/MisOrdenes/g,
        new: '@/src/modules/cliente/mis-ordenes/components/MisOrdenes',
        description: 'Mis ordenes components'
    },

    // LANDING
    {
        old: /@\/src\/components\/landing\/(RestaurantLandingPage|Header|Footer|HeroSection|MenuSection|InfoSection|LocationSection)/g,
        new: '@/src/modules/landing/components/$1',
        description: 'Landing components'
    },

    // SHARED - COMPONENTS
    {
        old: /@\/src\/components\/ui\/(Loading|Logo|CookieBanner)/g,
        new: '@/src/shared/components/ui/$1',
        description: 'UI components'
    },
    {
        old: /@\/src\/components\/(Paginacion|NotFound|Unauthorized|SupabaseProvider)/g,
        new: '@/src/shared/components/$1',
        description: 'Shared components'
    },

    // SHARED - LAYOUTS
    {
        old: /@\/src\/components\/layouts\/(AdminLayoutClient|DuenoLayoutClient|RepartidorLayoutClient|DomiciliosLayoutClient)/g,
        new: '@/src/shared/layouts/$1',
        description: 'Layouts'
    },

    // SHARED - STORE
    {
        old: /@\/src\/store\/(useUserStore|cookieConsentStore)/g,
        new: '@/src/shared/store/$1',
        description: 'Shared store'
    },

    // SHARED - UTILS
    {
        old: /@\/src\/utils\/(precio|texto)/g,
        new: '@/src/shared/utils/$1',
        description: 'Utils'
    },

    // SHARED - CONSTANTS
    {
        old: /@\/src\/constants\/app-routes/g,
        new: '@/src/shared/constants/app-routes',
        description: 'Constants'
    },

    // SHARED - TYPES
    {
        old: /@\/src\/types\/database/g,
        new: '@/src/shared/types/database',
        description: 'Database types'
    },
];

function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules, .next, etc
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
                getAllTsxFiles(filePath, fileList);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function updateImportsInFile(filePath: string): { updated: boolean; changes: number } {
    const content = fs.readFileSync(filePath, 'utf-8');
    let newContent = content;
    let changes = 0;

    importMappings.forEach(mapping => {
        const matches = newContent.match(mapping.old);
        if (matches) {
            newContent = newContent.replace(mapping.old, mapping.new);
            changes += matches.length;
        }
    });

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        return { updated: true, changes };
    }

    return { updated: false, changes: 0 };
}

async function updateAllImports(): Promise<void> {
    console.log('🔄 Actualizando imports en todos los archivos...\n');

    const allFiles = getAllTsxFiles(BASE_PATH);
    const tsFiles = allFiles.filter(f =>
        f.includes('/src/') ||
        f.includes('/app/') ||
        f.includes('middleware.ts')
    );

    console.log(`📁 Encontrados ${tsFiles.length} archivos TypeScript/React\n`);

    let updatedFiles = 0;
    let totalChanges = 0;
    const fileChanges: Array<{ file: string; changes: number }> = [];

    for (const file of tsFiles) {
        const result = updateImportsInFile(file);
        if (result.updated) {
            updatedFiles++;
            totalChanges += result.changes;
            fileChanges.push({
                file: file.replace(BASE_PATH, ''),
                changes: result.changes
            });
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 RESUMEN DE ACTUALIZACIÓN DE IMPORTS');
    console.log('='.repeat(60));
    console.log(`✅ Archivos actualizados: ${updatedFiles}`);
    console.log(`🔄 Total de imports cambiados: ${totalChanges}`);
    console.log(`📦 Total de archivos revisados: ${tsFiles.length}`);
    console.log('='.repeat(60));

    if (fileChanges.length > 0) {
        console.log('\n📝 ARCHIVOS MODIFICADOS:\n');
        fileChanges.forEach(({ file, changes }) => {
            console.log(`  ${file} (${changes} cambios)`);
        });
    }

    console.log('\n✨ Actualización de imports completada!\n');
    console.log('📝 PRÓXIMOS PASOS:');
    console.log('1. Verificar que todo compile: npm run build');
    console.log('2. Revisar imports manualmente si hay errores');
    console.log('3. Probar la aplicación: npm run dev\n');
}

// Ejecutar actualización
updateAllImports().catch(console.error);