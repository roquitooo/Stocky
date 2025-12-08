import { useQuery } from "@tanstack/react-query";
import {
  POSTemplate,
  SpinnerSecundario,
  useAlmacenesStore,
  useEmpresaStore,
  useProductosStore,
  useSucursalesStore,
  useVentasStore,
} from "../index";
import { useCajasStore } from "../store/CajasStore";
import { useCierreCajaStore } from "../store/CierreCajaStore";
import { PantallaAperturaCaja } from "../components/organismos/POSDesign/CajaDesign/PantallaAperturaCaja";
import { useMetodosPagoStore } from "../store/MetodosPagoStore";

export function POS() {
  const { dataempresa } = useEmpresaStore();
  const { mostrarAlmacenXsucursal } = useAlmacenesStore();
  const { buscarProductos, buscador } = useProductosStore();
  const { sucursalesItemSelectAsignadas } = useSucursalesStore();
  const { mostrarCajaXSucursal } = useCajasStore();
  const { mostrarCierreCaja } = useCierreCajaStore();
  const { mostrarMetodosPago } = useMetodosPagoStore();

  useQuery({
    queryKey: ["buscar productos", buscador, sucursalesItemSelectAsignadas?.id_sucursal],
    queryFn: () =>
      buscarProductos({ 
        id_empresa: dataempresa?.id, 
        buscador: buscador,
        id_sucursal: sucursalesItemSelectAsignadas?.id_sucursal
      }),
    enabled: !!dataempresa?.id && !!sucursalesItemSelectAsignadas?.id_sucursal,
    refetchOnWindowFocus: false,
  });

  const { isLoading: isLoadingAlmacen } = useQuery({
    queryKey: [
      "mostrar almacen por sucursal",
      sucursalesItemSelectAsignadas?.id_sucursal,
    ],
    queryFn: () =>
      mostrarAlmacenXsucursal({
        id_sucursal: sucursalesItemSelectAsignadas?.id_sucursal,
      }),
    enabled: !!sucursalesItemSelectAsignadas && !!dataempresa?.id,
  });

  const { data: dataCaja, isLoading: isLoadingCaja } = useQuery({
    queryKey: [
      "mostrar caja x sucursal",
      { id_sucursal: sucursalesItemSelectAsignadas?.id_sucursal },
    ],
    queryFn: () =>
      mostrarCajaXSucursal({
        id_sucursal: sucursalesItemSelectAsignadas?.id_sucursal,
      }),
    enabled: !!sucursalesItemSelectAsignadas && !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const {
    data: dataCierreCaja,
    isLoading: isLoadingCierreCaja,
    error: errorCierreCaja,
  } = useQuery({
    queryKey: ["mostrar cierre de caja", { id_caja: dataCaja?.id }],
    queryFn: () => mostrarCierreCaja({ id_caja: dataCaja?.id }),
    enabled: !!dataCaja && !!dataempresa?.id,
  });
  
  const { isLoading: isLoadingMetodosPago } = useQuery({
    queryKey: ["mostrar metodos de pago"],
    queryFn: () => mostrarMetodosPago({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });
   
  const isLoading = isLoadingAlmacen || isLoadingCaja || isLoadingCierreCaja || isLoadingMetodosPago;

  // --- DIAGNÓSTICO (MIRA LA CONSOLA DEL NAVEGADOR) ---
  console.log("--- DEBUG POS ---");
  console.log("1. Empresa ID:", dataempresa?.id);
  console.log("2. Sucursal ID:", sucursalesItemSelectAsignadas?.id_sucursal);
  console.log("3. Data Caja (ID Caja):", dataCaja);
  console.log("4. ¿Query Cierre Caja habilitada?:", !!dataCaja && !!dataempresa?.id);
  console.log("5. Data Cierre Caja (RESULTADO FINAL):", dataCierreCaja);
  console.log("-----------------");
  // ---------------------------------------------------

  if (isLoading) {
    return <SpinnerSecundario texto="Cargando datos..." />;
  }

  if (errorCierreCaja) {
    return <span>Error: {errorCierreCaja.message}</span>;
  }

  return dataCierreCaja ? <POSTemplate /> : <PantallaAperturaCaja />;
}