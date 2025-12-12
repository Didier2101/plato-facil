# Estructura del Proyecto

Generado el: 12/12/2025, 3:58:55 p. m.

```
Kavvo/
├── 📁 app
│   ├── 📁 (private)
│   │   ├── 📁 admin
│   │   │   ├── 📁 caja
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 ordenes
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 productos
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 tienda
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 dueno
│   │   │   ├── 📁 configuraciones
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 reportes
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 usuarios
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 layout.tsx
│   │   └── 📁 repartidor
│   │       ├── 📁 mis-entregas
│   │       │   └── 📄 page.tsx
│   │       ├── 📁 ordenes-listas
│   │       │   └── 📄 page.tsx
│   │       └── 📄 layout.tsx
│   ├── 📁 (public)
│   │   ├── 📁 a-domicilio
│   │   │   ├── 📁 domicilios
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 informacion
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 mis-ordenes
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 establecimiento
│   │   │   └── 📄 page.tsx
│   │   └── 📁 login
│   │       └── 📄 page.tsx
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
│   ├── 📁 actions
│   │   ├── 📁 domicilio
│   │   │   └── 📄 clienteDomicilioAction.ts
│   │   ├── 📁 dueno
│   │   │   ├── 📄 configuracionRestauranteActions.ts
│   │   │   ├── 📄 crearUsuarioAction.ts
│   │   │   ├── 📄 editarUsuarioAction.ts
│   │   │   ├── 📄 obtenerReporteAvanzadoAction.ts
│   │   │   ├── 📄 obtenerUsuariosAction.ts
│   │   │   └── 📄 toggleUsuarioAction.ts
│   │   ├── 📁 login
│   │   │   ├── 📄 auth.ts
│   │   │   └── 📄 loginActions.ts
│   │   ├── 📁 repartidor
│   │   │   ├── 📄 obtenerEntregasRepartidorAction.ts
│   │   │   └── 📄 obtenerMisDomiciliosAction.ts
│   │   ├── 📄 actualizarEstadoOrdenAction.ts
│   │   ├── 📄 actualizarProductoAction.ts
│   │   ├── 📄 buscarOrdenPorTelefonoAction.ts
│   │   ├── 📄 calculoDomicilioAction.ts
│   │   ├── 📄 categoriasActions.ts
│   │   ├── 📄 cobrarOrdenAction.ts
│   │   ├── 📄 crearOrdenAction.ts
│   │   ├── 📄 crearProductoAction.ts
│   │   ├── 📄 desactivarProductoAction.ts
│   │   ├── 📄 eliminarOrdenAction.ts
│   │   ├── 📄 guardarClienteAction.ts
│   │   ├── 📄 ingredientesActions.ts
│   │   ├── 📄 obtenerIngredientesAction.ts
│   │   ├── 📄 obtenerOrdenesAction.ts
│   │   ├── 📄 obtenerOrdenesDomicilioAction.ts
│   │   ├── 📄 obtenerOrdenesListasAction.ts
│   │   ├── 📄 obtenerProductosAction.ts
│   │   └── 📄 registrarPropinaAction.ts
│   ├── 📁 components
│   │   ├── 📁 PanelCobro
│   │   │   ├── 📁 components
│   │   │   │   ├── 📄 BotonConfirmarCobro.tsx
│   │   │   │   ├── 📄 ResumenTotales.tsx
│   │   │   │   ├── 📄 SelectorComprobante.tsx
│   │   │   │   ├── 📄 SelectorMetodoPago.tsx
│   │   │   │   └── 📄 SelectorPropina.tsx
│   │   │   ├── 📁 constants
│   │   │   │   └── 📄 cobro.ts
│   │   │   ├── 📁 hooks
│   │   │   │   ├── 📄 useCobroProcess.ts
│   │   │   │   ├── 📄 useFacturacionLogic.ts
│   │   │   │   └── 📄 usePropinaLogic.ts
│   │   │   ├── 📁 types
│   │   │   │   └── 📄 cobro.ts
│   │   │   ├── 📁 utils
│   │   │   │   ├── 📄 calculosCobro.ts
│   │   │   │   └── 📄 validacionesCobro.ts
│   │   │   ├── 📄 PanelCobro.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 admin
│   │   │   ├── 📁 caja
│   │   │   │   ├── 📄 CajaLista.tsx
│   │   │   │   └── 📄 PanelCobro.tsx
│   │   │   ├── 📁 ordenes
│   │   │   │   ├── 📄 OrdenCard.tsx
│   │   │   │   └── 📄 Ordenes.tsx
│   │   │   └── 📁 productos
│   │   │       ├── 📄 DetalleProducto.tsx
│   │   │       ├── 📄 FormAgregarProducto.tsx
│   │   │       └── 📄 ProductosLista.tsx
│   │   ├── 📁 auth
│   │   │   ├── 📄 Login.tsx
│   │   │   └── 📄 LogoutButton.tsx
│   │   ├── 📁 cliente-domicilio
│   │   │   ├── 📄 Domicilios.tsx
│   │   │   ├── 📄 MisOrdenes.tsx
│   │   │   └── 📄 ModalDatosCliente.tsx
│   │   ├── 📁 domiciliario
│   │   │   ├── 📄 DomiciliarioPanel.tsx
│   │   │   └── 📄 MisDomiciliosComponent.tsx
│   │   ├── 📁 domicilio
│   │   │   ├── 📄 CalculadorDomicilio.tsx
│   │   │   ├── 📄 InformacionRestaurante.tsx
│   │   │   └── 📄 MapaUbicacion.tsx
│   │   ├── 📁 dueno
│   │   │   ├── 📄 Configuraciones.tsx
│   │   │   ├── 📄 FormAgregarUsuario.tsx
│   │   │   ├── 📄 ReportesAvanzadosComponent.tsx
│   │   │   └── 📄 Usuarios.tsx
│   │   ├── 📁 landing
│   │   │   ├── 📄 Footer.tsx
│   │   │   ├── 📄 Header.tsx
│   │   │   ├── 📄 HeroSection.tsx
│   │   │   ├── 📄 InfoSection.tsx
│   │   │   ├── 📄 LocationSection.tsx
│   │   │   ├── 📄 MenuSection.tsx
│   │   │   └── 📄 RestaurantLandingPage.tsx
│   │   ├── 📁 layouts
│   │   │   ├── 📄 AdminLayoutClient.tsx
│   │   │   ├── 📄 DomiciliosLayoutClient.tsx
│   │   │   ├── 📄 DuenoLayoutClient.tsx
│   │   │   └── 📄 RepartidorLayoutClient.tsx
│   │   ├── 📁 tienda
│   │   │   ├── 📄 CarritoResumen.tsx
│   │   │   ├── 📄 ProductoCard.tsx
│   │   │   ├── 📄 ProductoDetalleModal.tsx
│   │   │   └── 📄 TiendaProductos.tsx
│   │   ├── 📁 ui
│   │   │   ├── 📄 CookieBanner.tsx
│   │   │   ├── 📄 Loading.tsx
│   │   │   └── 📄 Logo.tsx
│   │   ├── 📄 NotFound.tsx
│   │   ├── 📄 Paginacion.tsx
│   │   ├── 📄 ProbadorFactus.tsx
│   │   ├── 📄 SupabaseProvider.tsx
│   │   └── 📄 Unauthorized.tsx
│   ├── 📁 constants
│   │   └── 📄 app-routes.ts
│   ├── 📁 hooks
│   │   ├── 📄 useDomicilioCalculator.ts
│   │   └── 📄 useLogin.ts
│   ├── 📁 lib
│   │   ├── 📁 auth
│   │   │   └── 📄 checkRole.ts
│   │   ├── 📄 cookies.ts
│   │   ├── 📄 database.types.ts
│   │   ├── 📄 supabaseAdmin.ts
│   │   └── 📄 supabaseClient.ts
│   ├── 📁 schemas
│   │   └── 📄 auth.ts
│   ├── 📁 store
│   │   ├── 📄 carritoStore.ts
│   │   ├── 📄 clienteStore.ts
│   │   ├── 📄 cookieConsentStore.ts
│   │   └── 📄 useUserStore.ts
│   ├── 📁 styles
│   ├── 📁 types
│   │   ├── 📄 auth.ts
│   │   ├── 📄 cliente.ts
│   │   ├── 📄 database.ts
│   │   ├── 📄 domicilios.ts
│   │   ├── 📄 factus.ts
│   │   ├── 📄 orden.ts
│   │   ├── 📄 producto.ts
│   │   └── 📄 reportes.ts
│   └── 📁 utils
│       ├── 📄 precio.ts
│       └── 📄 texto.ts
├── 📄 .gitignore
├── 📄 PROJECT_STRUCTURE.md
├── 📄 README.md
├── 📄 eslint.config.mjs
├── 📄 middleware.ts
├── 📄 next-env.d.ts
├── 📄 next.config.ts
├── 📄 package.json
├── 📄 postcss.config.mjs
└── 📄 tsconfig.json

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
