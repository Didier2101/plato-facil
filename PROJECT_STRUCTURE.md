# Estructura del Proyecto

Generado el: 30/12/2025, 9:45:39 a. m.

```
Kavvo/
├── 📁 app
│   ├── 📁 (public)
│   │   ├── 📁 a-domicilios
│   │   │   ├── 📁 domicilios
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 mis-ordenes
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 establecimiento
│   │   │   └── 📄 page.tsx
│   │   └── 📁 login
│   │       └── 📄 page.tsx
│   ├── 📁 administrativo
│   │   ├── 📁 (admin)
│   │   │   ├── 📁 caja
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 ordenes
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 productos
│   │   │   │   ├── 📁 nuevo
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 tienda
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 (dueno)
│   │   │   ├── 📁 configuraciones
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 reportes
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 usuarios
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   └── 📁 (repartidor)
│   │       ├── 📁 mis-entregas
│   │       │   └── 📄 page.tsx
│   │       ├── 📁 ordenes-listas
│   │       │   └── 📄 page.tsx
│   │       ├── 📄 layout.tsx
│   │       └── 📄 loading.tsx
│   ├── 📁 unauthorized
│   │   └── 📄 page.tsx
│   ├── 📄 globals.css
│   ├── 📄 layout.tsx
│   ├── 📄 not-found.tsx
│   └── 📄 page.tsx
├── 📁 public
│   ├── 📁 assets
│   │   ├── 📄 logo-kavvo-solo.png
│   │   ├── 📄 logo-kavvo.png
│   │   └── 📄 logo-solo.png
│   ├── 📄 robots.txt
│   └── 📄 sitemap.xml
├── 📁 scripts
│   └── 📄 generate-structure.ts
├── 📁 src
│   ├── 📁 lib
│   │   ├── 📁 auth
│   │   │   └── 📄 checkRole.ts
│   │   ├── 📄 cookies.ts
│   │   ├── 📄 database.types.ts
│   │   ├── 📄 supabaseAdmin.ts
│   │   └── 📄 supabaseClient.ts
│   ├── 📁 modules
│   │   ├── 📁 admin
│   │   │   ├── 📁 caja
│   │   │   │   ├── 📁 actions
│   │   │   │   │   ├── 📄 cobrarOrdenAction.ts
│   │   │   │   │   └── 📄 registrarPropinaAction.ts
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 BotonConfirmarCobro.tsx
│   │   │   │   │   ├── 📄 CajaLista.tsx
│   │   │   │   │   ├── 📄 GeneradorRecibo.tsx
│   │   │   │   │   ├── 📄 PanelCobro.tsx
│   │   │   │   │   ├── 📄 ResumenTotales.tsx
│   │   │   │   │   ├── 📄 SelectorComprobante.tsx
│   │   │   │   │   ├── 📄 SelectorMetodoPago.tsx
│   │   │   │   │   └── 📄 SelectorPropina.tsx
│   │   │   │   ├── 📁 constants
│   │   │   │   │   └── 📄 cobro.ts
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   ├── 📄 useCobroProcess.ts
│   │   │   │   │   ├── 📄 useFacturacionLogic.ts
│   │   │   │   │   └── 📄 usePropinaLogic.ts
│   │   │   │   ├── 📁 types
│   │   │   │   │   └── 📄 cobro.ts
│   │   │   │   └── 📁 utils
│   │   │   │       ├── 📄 calculosCobro.ts
│   │   │   │       └── 📄 validacionesCobro.ts
│   │   │   ├── 📁 ordenes
│   │   │   │   ├── 📁 actions
│   │   │   │   │   ├── 📄 actualizarEstadoOrdenAction.ts
│   │   │   │   │   ├── 📄 buscarOrdenPorTelefonoAction.ts
│   │   │   │   │   ├── 📄 crearOrdenAction.ts
│   │   │   │   │   ├── 📄 eliminarOrdenAction.ts
│   │   │   │   │   └── 📄 obtenerOrdenesAction.ts
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 OrdenCard.tsx
│   │   │   │   │   └── 📄 Ordenes.tsx
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   └── 📄 useOrdenes.ts
│   │   │   │   └── 📁 types
│   │   │   │       └── 📄 orden.ts
│   │   │   ├── 📁 productos
│   │   │   │   ├── 📁 actions
│   │   │   │   │   ├── 📄 actualizarCategoriaAction.ts
│   │   │   │   │   ├── 📄 actualizarIngredienteAction.ts
│   │   │   │   │   ├── 📄 actualizarProductoAction.ts
│   │   │   │   │   ├── 📄 crearCategoriaAction.ts
│   │   │   │   │   ├── 📄 crearIngredienteAction.ts
│   │   │   │   │   ├── 📄 crearProductoAction.ts
│   │   │   │   │   ├── 📄 desactivarCategoriaAction.ts
│   │   │   │   │   ├── 📄 desactivarIngredienteAction.ts
│   │   │   │   │   ├── 📄 desactivarProductoAction.ts
│   │   │   │   │   ├── 📄 obtenerCategoriasAction.ts
│   │   │   │   │   ├── 📄 obtenerIngredientesAction.ts
│   │   │   │   │   └── 📄 obtenerProductosAction.ts
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 DetalleProducto.tsx
│   │   │   │   │   ├── 📄 FormAgregarProducto.tsx
│   │   │   │   │   ├── 📄 ProductImageUploader.tsx
│   │   │   │   │   └── 📄 ProductosLista.tsx
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   ├── 📄 index.ts
│   │   │   │   │   ├── 📄 useCategorias.ts
│   │   │   │   │   ├── 📄 useCrearProducto.ts
│   │   │   │   │   ├── 📄 useDetalleProducto.ts
│   │   │   │   │   ├── 📄 useIngredientes.ts
│   │   │   │   │   └── 📄 useProductos.ts
│   │   │   │   ├── 📁 schemas
│   │   │   │   │   └── 📄 productoSchema.ts
│   │   │   │   └── 📁 types
│   │   │   │       └── 📄 producto.ts
│   │   │   └── 📁 tienda
│   │   │       ├── 📁 actions
│   │   │       │   ├── 📄 categoriasActions.ts
│   │   │       │   ├── 📄 ingredientesActions.ts
│   │   │       │   └── 📄 obtenerIngredientesAction.ts
│   │   │       ├── 📁 components
│   │   │       │   ├── 📄 Carrito.tsx
│   │   │       │   ├── 📄 ProductoCard.tsx
│   │   │       │   ├── 📄 ProductoDetalleModal.tsx
│   │   │       │   └── 📄 TiendaProductos.tsx
│   │   │       ├── 📁 hooks
│   │   │       │   ├── 📄 useCarritoResumen.ts
│   │   │       │   ├── 📄 useProductoCard.ts
│   │   │       │   ├── 📄 useProductoDetalleTienda.ts
│   │   │       │   └── 📄 useTienda.ts
│   │   │       └── 📁 store
│   │   │           └── 📄 carritoStore.ts
│   │   ├── 📁 auth
│   │   │   ├── 📁 actions
│   │   │   │   ├── 📄 auth.ts
│   │   │   │   └── 📄 loginActions.ts
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 Login.tsx
│   │   │   │   └── 📄 LogoutButton.tsx
│   │   │   ├── 📁 hooks
│   │   │   │   ├── 📄 useLogin.ts
│   │   │   │   └── 📄 useLogout.ts
│   │   │   ├── 📁 schemas
│   │   │   │   └── 📄 auth.ts
│   │   │   └── 📁 types
│   │   │       └── 📄 auth.ts
│   │   ├── 📁 cliente
│   │   │   ├── 📁 domicilios
│   │   │   │   ├── 📁 actions
│   │   │   │   │   ├── 📄 calculoDomicilioAction.ts
│   │   │   │   │   ├── 📄 clienteDomicilioAction.ts
│   │   │   │   │   ├── 📄 guardarClienteAction.ts
│   │   │   │   │   └── 📄 obtenerOrdenesDomicilioAction.ts
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 CalculadorDomicilio.tsx
│   │   │   │   │   ├── 📄 Domicilios.tsx
│   │   │   │   │   ├── 📄 MapaUbicacion.tsx
│   │   │   │   │   └── 📄 ModalDatosCliente.tsx
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   ├── 📄 useCliente.ts
│   │   │   │   │   ├── 📄 useDomicilioCalculator.ts
│   │   │   │   │   └── 📄 useDomicilios.ts
│   │   │   │   ├── 📁 store
│   │   │   │   │   └── 📄 clienteStore.ts
│   │   │   │   └── 📁 types
│   │   │   │       ├── 📄 cliente.ts
│   │   │   │       └── 📄 domicilios.ts
│   │   │   └── 📁 mis-ordenes
│   │   │       └── 📁 components
│   │   │           └── 📄 MisOrdenes.tsx
│   │   ├── 📁 dueno
│   │   │   ├── 📁 configuraciones
│   │   │   │   ├── 📁 actions
│   │   │   │   │   └── 📄 configuracionRestauranteActions.ts
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 ConfiguracionDomicilios.tsx
│   │   │   │   │   ├── 📄 Configuraciones.tsx
│   │   │   │   │   ├── 📄 EstadoServicios.tsx
│   │   │   │   │   ├── 📄 ImageUploader.tsx
│   │   │   │   │   ├── 📄 InformacionBasica.tsx
│   │   │   │   │   └── 📄 LocationPicker.tsx
│   │   │   │   └── 📁 hooks
│   │   │   │       ├── 📄 useConfiguracion.ts
│   │   │   │       ├── 📄 useConfiguracionMutaciones.ts
│   │   │   │       └── 📄 useImageUploader.ts
│   │   │   ├── 📁 reportes
│   │   │   │   ├── 📁 actions
│   │   │   │   │   └── 📄 obtenerReporteAvanzadoAction.ts
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 MetricCard.tsx
│   │   │   │   │   ├── 📄 MetricasResumen.tsx
│   │   │   │   │   ├── 📄 ReporteFiltros.tsx
│   │   │   │   │   ├── 📄 ReportesAvanzadosComponent.tsx
│   │   │   │   │   ├── 📄 VistaResumen.tsx
│   │   │   │   │   └── 📄 VistaVentas.tsx
│   │   │   │   ├── 📁 hooks
│   │   │   │   │   ├── 📄 useReporteData.ts
│   │   │   │   │   └── 📄 useReporteFilters.ts
│   │   │   │   ├── 📁 types
│   │   │   │   │   ├── 📄 reportes.ts
│   │   │   │   │   └── 📄 reportesTypes.ts
│   │   │   │   └── 📁 utils
│   │   │   │       └── 📄 formatUtils.ts
│   │   │   └── 📁 usuarios
│   │   │       ├── 📁 actions
│   │   │       │   ├── 📄 crearUsuarioAction.ts
│   │   │       │   ├── 📄 editarUsuarioAction.ts
│   │   │       │   ├── 📄 obtenerUsuariosAction.ts
│   │   │       │   └── 📄 toggleUsuarioAction.ts
│   │   │       ├── 📁 components
│   │   │       │   ├── 📄 CrearUsuarioModal.tsx
│   │   │       │   ├── 📄 EditarUsuarioModal.tsx
│   │   │       │   ├── 📄 FormAgregarUsuario.tsx
│   │   │       │   ├── 📄 FormField.tsx
│   │   │       │   ├── 📄 Usuarios.tsx
│   │   │       │   ├── 📄 UsuariosStats.tsx
│   │   │       │   └── 📄 UsuariosTable.tsx
│   │   │       ├── 📁 hooks
│   │   │       │   ├── 📄 useUsuariosData.ts
│   │   │       │   └── 📄 useUsuariosMutaciones.ts
│   │   │       ├── 📁 schemas
│   │   │       │   └── 📄 usuarioSchema.ts
│   │   │       ├── 📁 types
│   │   │       │   └── 📄 usuarioTypes.ts
│   │   │       └── 📁 utils
│   │   │           └── 📄 usuarioUtils.ts
│   │   ├── 📁 landing
│   │   │   └── 📁 components
│   │   │       ├── 📄 Footer.tsx
│   │   │       ├── 📄 Header.tsx
│   │   │       ├── 📄 HeroSection.tsx
│   │   │       ├── 📄 InfoSection.tsx
│   │   │       ├── 📄 LocationSection.tsx
│   │   │       ├── 📄 MenuSection.tsx
│   │   │       └── 📄 RestaurantLandingPage.tsx
│   │   └── 📁 repartidor
│   │       ├── 📁 entregas
│   │       │   ├── 📁 actions
│   │       │   │   ├── 📄 marcarLlegadaAction.ts
│   │       │   │   ├── 📄 obtenerEntregasRepartidorAction.ts
│   │       │   │   ├── 📄 obtenerMisDomiciliosAction.ts
│   │       │   │   └── 📄 tomarOrdenAction.ts
│   │       │   ├── 📁 components
│   │       │   │   ├── 📄 DomiciliarioPanel.tsx
│   │       │   │   └── 📄 MisDomiciliosComponent.tsx
│   │       │   ├── 📁 hooks
│   │       │   │   ├── 📄 useEntregasActivas.ts
│   │       │   │   └── 📄 useHistorialEntregas.ts
│   │       │   └── 📁 types
│   │       │       └── 📄 entrega.ts
│   │       └── 📁 ordenes-listas
│   │           └── 📁 actions
│   │               └── 📄 obtenerOrdenesListasAction.ts
│   └── 📁 shared
│       ├── 📁 components
│       │   ├── 📁 layout
│       │   │   └── 📄 AppShell.tsx
│       │   ├── 📁 ui
│       │   │   ├── 📄 CookieBanner.tsx
│       │   │   ├── 📄 Loading.tsx
│       │   │   ├── 📄 Logo.tsx
│       │   │   └── 📄 NotificationAppDelivery.tsx
│       │   ├── 📄 ErrorState.tsx
│       │   ├── 📄 NotFound.tsx
│       │   ├── 📄 PageHeader.tsx
│       │   ├── 📄 Paginacion.tsx
│       │   ├── 📄 SupabaseProvider.tsx
│       │   ├── 📄 ToasterProvider.tsx
│       │   ├── 📄 Unauthorized.tsx
│       │   └── 📄 index.ts
│       ├── 📁 constants
│       │   ├── 📄 app-routes.ts
│       │   ├── 📄 estado-orden.ts
│       │   ├── 📄 metodo-pago.ts
│       │   ├── 📄 orden.ts
│       │   └── 📄 rol.ts
│       ├── 📁 hooks
│       │   └── 📄 useImageOptimizer.ts
│       ├── 📁 layouts
│       │   ├── 📄 AdminLayoutClient.tsx
│       │   ├── 📄 DomiciliosLayoutClient.tsx
│       │   ├── 📄 DuenoLayoutClient.tsx
│       │   └── 📄 RepartidorLayoutClient.tsx
│       ├── 📁 services
│       │   └── 📄 toast.service.tsx
│       ├── 📁 store
│       │   ├── 📄 cookieConsentStore.ts
│       │   └── 📄 useUserStore.ts
│       ├── 📁 types
│       │   ├── 📄 database.ts
│       │   ├── 📄 estado-orden.ts
│       │   ├── 📄 metodo-pago.ts
│       │   ├── 📄 orden.ts
│       │   ├── 📄 rol.ts
│       │   └── 📄 ruta.ts
│       └── 📁 utils
│           ├── 📁 image-optimizer
│           │   ├── 📄 ImageOptimizer.ts
│           │   ├── 📄 ImageResizer.ts
│           │   ├── 📄 WebPConverter.ts
│           │   ├── 📄 index.ts
│           │   └── 📄 types.ts
│           ├── 📄 precio.ts
│           └── 📄 texto.ts
├── 📄 .gitignore
├── 📄 PROJECT_STRUCTURE.md
├── 📄 README.md
├── 📄 eslint.config.mjs
├── 📄 middleware.ts
├── 📄 next-env.d.ts
├── 📄 next.config.ts
├── 📄 package.json
├── 📄 postcss.config.mjs
├── 📄 tsconfig.json
└── 📄 tsconfig.tsbuildinfo

```

## Descripción de Directorios Principales

### `/app`
Directorio principal de Next.js 15 App Router. Contiene todas las rutas y layouts de la aplicación.

### `/components`
Componentes React reutilizables organizados por funcionalidad.

### `/lib`
Utilidades, helpers, y configuraciones (Supabase client, etc.).

### `/types`
Definiciones de tipos TypeScript para la aplicación.

### `/hooks`
Custom hooks de React.

### `/utils`
Funciones de utilidad y helpers.

### `/public`
Archivos estáticos (imágenes, fonts, etc.).

### `/styles`
Archivos de estilos globales (si los hay).
