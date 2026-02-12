import { useQuery } from "@tanstack/react-query";
import {
  POSTemplate,
  SpinnerSecundario,
  useAlmacenesStore,
  useEmpresaStore,
  useProductosStore,
  useSucursalesStore,
} from "../index";
import { useCajasStore } from "../store/CajasStore";
import { useCierreCajaStore } from "../store/CierreCajaStore";
import { PantallaAperturaCaja } from "../components/organismos/POSDesign/CajaDesign/PantallaAperturaCaja";
import { useMetodosPagoStore } from "../store/MetodosPagoStore";

export function POS() {
  const { dataempresa } = useEmpresaStore();
  const { mostrarAlmacenXsucursal } = useAlmacenesStore();
  const { buscarProductos, buscador } = useProductosStore();
  // 1. CORRECCIÓN DE NOMBRE: Usamos el nombre real del Store
  const { sucursalesItemSelect } = useSucursalesStore();
  const { mostrarCajaXSucursal } = useCajasStore();
  const { mostrarCierreCaja } = useCierreCajaStore();
  const { mostrarMetodosPago } = useMetodosPagoStore();

  // 2. LÓGICA SEGURA: Manejamos si es Array, Objeto o Null
  const asignacionActiva = Array.isArray(sucursalesItemSelect)
    ? sucursalesItemSelect[0]
    : sucursalesItemSelect;

  // 3. EXTRACCIÓN SEGURA: Usamos ?. para evitar el crash si es undefined
  // Intentamos leer id_sucursal (si es asignación) o id (si es sucursal directa)
  const id_sucursal = asignacionActiva?.id_sucursal || asignacionActiva?.id;

  // --- QUERY PRODUCTOS ---
  useQuery({
    queryKey: ["buscar productos", buscador, id_sucursal],
    queryFn: () =>
      buscarProductos({ 
        id_empresa: dataempresa?.id, 
        buscador: buscador,
        id_sucursal: id_sucursal 
      }),
    enabled: !!dataempresa?.id && !!id_sucursal,
    refetchOnWindowFocus: false,
  });

  // --- QUERY ALMACEN ---
  const { isLoading: isLoadingAlmacen } = useQuery({
    queryKey: ["mostrar almacen por sucursal", id_sucursal],
    queryFn: () =>
      mostrarAlmacenXsucursal({
        id_sucursal: id_sucursal,
      }),
    enabled: !!id_sucursal && !!dataempresa?.id,
  });

  // --- QUERY CAJA ---
  const { data: dataCaja, isLoading: isLoadingCaja } = useQuery({
    queryKey: ["mostrar caja x sucursal", { id_sucursal: id_sucursal }],
    queryFn: () =>
      mostrarCajaXSucursal({
        id_sucursal: id_sucursal,
      }),
    enabled: !!id_sucursal && !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  // 4. VALIDACIÓN DE CAJA SEGURA
  const cajaActiva = Array.isArray(dataCaja) ? dataCaja[0] : dataCaja;
  const id_caja = cajaActiva?.id;

  // --- QUERY CIERRE CAJA ---
  const {
    data: dataCierreCaja,
    isLoading: isLoadingCierreCaja,
    error: errorCierreCaja,
  } = useQuery({
    queryKey: ["mostrar cierre de caja", { id_caja: id_caja }],
    queryFn: () => mostrarCierreCaja({ id_caja: id_caja }),
    enabled: !!id_caja && !!dataempresa?.id,
    retry: 1, // No reintentar infinitamente si falla
  });
  
  // --- QUERY METODOS PAGO ---
  const { isLoading: isLoadingMetodosPago } = useQuery({
    queryKey: ["mostrar metodos de pago"],
    queryFn: () => mostrarMetodosPago({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });
   
  const isLoading = isLoadingAlmacen || isLoadingCaja || isLoadingCierreCaja || isLoadingMetodosPago;

  // --- DEBUGGING (Puedes borrar esto cuando funcione) ---
  /*
  console.log("--- DEBUG POS ---");
  console.log("Sucursal Detectada:", id_sucursal);
  console.log("Caja Detectada:", id_caja);
  console.log("Data Cierre:", dataCierreCaja);
  */

  if (isLoading) {
    return <SpinnerSecundario texto="Cargando ventas..." />;
  }

  if (errorCierreCaja) {
    return (
      <div style={{padding: 20, textAlign: "center"}}>
        <h3>Error al cargar la caja</h3>
        <p>{errorCierreCaja.message}</p>
        <p>Verifica que la sucursal tenga una caja asignada.</p>
      </div>
    );
  }

  // Validación final para saber qué pantalla mostrar
  // Si dataCierreCaja existe (y no es array vacío), mostramos el POS. Si no, Apertura.
  const cajaEstaAbierta = Array.isArray(dataCierreCaja) 
    ? dataCierreCaja.length > 0 
    : !!dataCierreCaja;

  return cajaEstaAbierta ? <POSTemplate /> : <PantallaAperturaCaja />;
}