// --- PRINCIPALES ---
export { default as App } from './App';
export * from './main';

// --- ATOMOS ---
export * from './components/atomos/ContainerSelector';
export * from './components/atomos/ContentFiltros';
export * from './components/atomos/Icono';
export * from './components/atomos/Linea';
export * from './components/atomos/Title';

// --- MOLECULAS ---
export * from './components/moleculas/Btn1';
export * from './components/moleculas/Btngenerarcodigo';
export * from './components/moleculas/ImagenContent';
export * from './components/moleculas/LiveIndicator';
export * from './components/moleculas/Spinner1';
export * from './components/moleculas/SpinnerSecundario';
export * from './components/moleculas/SwitchHamburguesa';
export * from './components/moleculas/VolverBtn';

// --- ORGANISMOS: DASHBOARD ---
export * from './components/organismos/DashboardDesign/CardHistorialVentas';
export * from './components/organismos/DashboardDesign/CardMovimientosCajaLive';
export * from './components/organismos/DashboardDesign/CardProductosTopMonto';
export * from './components/organismos/DashboardDesign/CardTotales';
export * from './components/organismos/DashboardDesign/ChartProductosTop5';
export * from './components/organismos/DashboardDesign/ChartVentas';
export * from './components/organismos/DashboardDesign/DashboardHeader';
export * from './components/organismos/DashboardDesign/DateRangeFilter';

// --- ORGANISMOS: CONFIG EMPRESA ---
export * from './components/organismos/EmpresaConfigDesign/BasicosConfig';
export * from './components/organismos/EmpresaConfigDesign/MonedaConfig';

// --- ORGANISMOS: FORMULARIOS ---
export * from './components/organismos/formularios/AumentarPrecio';
export * from './components/organismos/formularios/InputText';
export * from './components/organismos/formularios/InputText2';
export * from './components/organismos/formularios/RegistrarCaja';
export * from './components/organismos/formularios/RegistrarCategorias';
export * from './components/organismos/formularios/RegistrarClientesProveedores';
export * from './components/organismos/formularios/RegistrarMetodosPago';
export * from './components/organismos/formularios/RegistrarProductos';
export * from './components/organismos/formularios/RegistrarSucursal';
export * from './components/organismos/formularios/RegistrarUsuarios';

// --- ORGANISMOS: HEADER ---
export * from './components/organismos/header/Header';
export * from './components/organismos/header/MenuMovil';

// --- ORGANISMOS: POS & CAJA ---
export * from './components/organismos/POSDesign/AreaDetalleventaPos';
export * from './components/organismos/POSDesign/AreaTecladoPos';
export * from './components/organismos/POSDesign/CajaDesign/PantallaAperturaCaja';
export * from './components/organismos/POSDesign/CajaDesign/PantallaCierreCaja';
export * from './components/organismos/POSDesign/CajaDesign/PantallaConteoCaja';
export * from './components/organismos/POSDesign/CajaDesign/PantallaIngresoSalidaDinero';
export * from './components/organismos/POSDesign/FooterPos';
export * from './components/organismos/POSDesign/HeaderPos';
export * from './components/organismos/POSDesign/IngresoCobro';
export * from './components/organismos/POSDesign/MenuFlotante';
export * from './components/organismos/POSDesign/PanelBuscador';
export * from './components/organismos/POSDesign/PantallaCobro';
export * from './components/organismos/POSDesign/TotalPos';
export * from './components/organismos/POSDesign/VisorTicketVenta';

// --- ORGANISMOS: SUCURSALES ---
export * from './components/organismos/SucursalesDesign/ListSucursales';

// --- ORGANISMOS: TABLAS ---
export * from './components/organismos/tablas/AccionesTabla';
export * from './components/organismos/tablas/ContentAccionesTabla';
export * from './components/organismos/tablas/Paginacion';
export * from './components/organismos/tablas/TablaCategorias';
export * from './components/organismos/tablas/TablaClientesProveedores';
export * from './components/organismos/tablas/TablaMetodosPago';
export * from './components/organismos/tablas/TablaMovimientosCajaLive';
export * from './components/organismos/tablas/TablaProductos';
export * from './components/organismos/tablas/TablaProductosTop10';
export * from './components/organismos/tablas/TablaUsuarios';

// --- ORGANISMOS: USUARIOS ---
export * from './components/organismos/UsuariosDesign/PermisosUser';

// --- ORGANISMOS: GENERALES ---
export * from './components/organismos/AlertaStock';
export * from './components/organismos/Buscador';
export * from './components/organismos/Checkbox1';
export * from './components/organismos/Footer';
export * from './components/organismos/ListaDesplegable';
export * from './components/organismos/NieveComponente';
export * from './components/organismos/Reloj';
export * from './components/organismos/Selector';
export * from './components/organismos/Switch1'; 
export * from './components/organismos/ToggleTema';

// --- TEMPLATES ---
export * from './components/templates/404';
export * from './components/templates/CategoriasTemplate';
export * from './components/templates/ClientesProveedoresTemplate';
export * from './components/templates/ConfiguracionesTemplate';
export * from './components/templates/DashboardTemplate';
export * from './components/templates/EmpresaTemplate';
export * from './components/templates/HomeTemplate';
export * from './components/templates/LoginTemplate';
export * from './components/templates/MetodosPagoTemplate';
export * from './components/templates/POSTemplate';
export * from './components/templates/ProductosTemplate';
export * from './components/templates/SucursalesCajasTemplate';
export * from './components/templates/UsuariosTemplate';
export * from './components/templates/Welcome';

// --- UI COMPONENTS ---
export * from './components/ui/animated/AnimatedGrid';
export * from './components/ui/buttons/BtnClose';
export * from './components/ui/buttons/ButtonDashed';
export * from './components/ui/lists/SelectList';
export * from './components/ui/toggles/Check';
export * from './components/ui/toggles/Switch';

// --- CONTEXT & HOOKS ---
export * from './context/AuthContent';
export * from './hooks/Generarcodigo';
export * from './hooks/Layout';
export * from './hooks/ProtectedRoute';
export * from './hooks/useFormattedDate';
export * from './hooks/useSupabaseSubscription';
export * from './hooks/useValidarPermisosOperativos';

// --- PAGES ---
export * from './pages/Categorias';
export * from './pages/ClientesProveedores';
export * from './pages/Configuraciones';
export * from './pages/Dashboard';
export * from './pages/Empresa';
export * from './pages/Home';
export * from './pages/Login';
export * from './pages/MetodosPago';
export * from './pages/POS';
export * from './pages/Productos';
export * from './pages/SucursalesCaja';
export * from './pages/Usuarios';

// --- REPORTS ---
export * from './reports/TicketVenta';

// --- ROUTERS ---
export * from './routers/routes';

// --- STORES ---
export * from './store/AlmacenesStore';
export * from './store/AsignacionCajaSucursalStore';
export * from './store/AuthStore';
export * from './store/CajasStore';
export * from './store/CartVentasStore';
export * from './store/CategoriasStore';
export * from './store/CierreCajaStore';
export * from './store/ClientesProveedoresStore';
export * from './store/DashboardStore';
export * from './store/DetalleVentasStore';
export * from './store/EmpresaStore';
export * from './store/MetodosPagoStore';
export * from './store/ModulosStore';
export * from './store/MonedasStore';
export * from './store/MovCajaStore';
export * from './store/PermisosStore';
export * from './store/ProductosStore';
export * from './store/RolesStore';
export * from './store/SucursalesStore';
export * from './store/ThemeStore';
export * from './store/UsuariosStore';
export * from './store/VentasStore';

// --- STYLES ---
export * from './styles/GlobalStyles';
export * from './styles/breakpoints';
export * from './styles/keyframes';
export * from './styles/themes';
export * from './styles/variables';

// --- SUPABASE CRUD ---
export * from './supabase/crudAlmacenes';
export * from './supabase/crudAsignacionCajaSucursal';
export * from './supabase/crudCaja';
export * from './supabase/crudCategorias';
export * from './supabase/crudCierresCaja';
export * from './supabase/crudClientesProveedores';
export * from './supabase/crudDetalleVenta';
export * from './supabase/crudEmpresa';
export * from './supabase/crudMetodosPago';
export * from './supabase/crudModulos';
export * from './supabase/crudMovimientosCaja';
export * from './supabase/crudPermisos';
export * from './supabase/crudProductos';
export * from './supabase/crudRol';
export * from './supabase/crudSucursales';
export * from './supabase/crudTipodocumentos';
export * from './supabase/crudUsuarios';
export * from './supabase/crudVenta';
export * from './supabase/supabase.config';

// --- UTILS ---
export * from './utils/Conversiones';
export * from './utils/CreatePdf';
export * from './utils/Efectonieve/NieveEffect';
export * from './utils/dataEstatica';