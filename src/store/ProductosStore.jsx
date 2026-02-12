import { create } from "zustand";
import {
  BuscarProductos,
  MostrarProductos,
  EliminarProductos,
  InsertarProductos,
  EditarProductos,
  Generarcodigo,
  useSucursalesStore // <--- 1. IMPORTAMOS EL STORE DE SUCURSALES
} from "../index";

import { supabase } from "../supabase/supabase.config";

export const useProductosStore = create((set, get) => ({
  refetchs: null,
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataProductos: [],
  productosItemSelect: {
    id: 1
  },
  parametros: {},

  // --- 2. HELPER: FUNCIÓN INTELIGENTE PARA DETECTAR SUCURSAL ---
  obtenerIdSucursalSeguro: (parametroId) => {
    // A. Si el componente ya lo envió, usamos ese.
    if (parametroId) return parametroId;

    // B. Si no, lo "robamos" del Store de Sucursales directamente
    try {
      const sucursalesState = useSucursalesStore.getState().sucursalesItemSelect;
      
      // Manejamos si es Array (lista) u Objeto (selección única)
      if (Array.isArray(sucursalesState)) {
         return sucursalesState[0]?.id || sucursalesState[0]?.id_sucursal;
      }
      return sucursalesState?.id || sucursalesState?.id_sucursal;
    } catch (e) {
      console.warn("No se pudo detectar sucursal automática:", e);
      return null;
    }
  },
  // -------------------------------------------------------------

  mostrarProductos: async (p) => {
    // 3. USAMOS EL HELPER ANTES DE CONSULTAR
    const idSucursalReal = get().obtenerIdSucursalSeguro(p.id_sucursal);
    
    // Construimos los parámetros corregidos
    const parametrosFixed = { 
        ...p, 
        id_sucursal: idSucursalReal 
    };

    const response = await MostrarProductos(parametrosFixed);
    
    set({ parametros: parametrosFixed }); // Guardamos los parámetros BUENOS para futuras recargas
    set({ dataProductos: response });
    
    if(response && response.length > 0) {
        set({ productosItemSelect: response[0] });
    }
    
    set({ refetchs: p.refetchs });
    return response;
  },

  selectProductos: (p) => {
    set({ productosItemSelect: p });
  },

  insertarProductos: async (p) => {
    // 4. Aseguramos que al insertar también vaya la sucursal
    const {id_sucursal, ...pInsertar} = p;

    const response = await InsertarProductos(pInsertar);
    
    // Recargamos usando los parámetros guardados (que ya tienen el ID correcto)
    const { mostrarProductos, parametros } = get();
    set(mostrarProductos(parametros));
    return response;
  },

  eliminarProductos: async (p) => {
    await EliminarProductos(p);
    const { mostrarProductos, parametros } = get();
    set(mostrarProductos(parametros));
  },

  editarProductos: async (p) => {
    await EditarProductos(p);
    const { mostrarProductos, parametros } = get();
    set(mostrarProductos(parametros));
  },

  buscarProductos: async (p) => {
    // 5. También protegemos la búsqueda
    const idSucursalReal = get().obtenerIdSucursalSeguro(p.id_sucursal);
    const parametrosFixed = { ...p, id_sucursal: idSucursalReal };

    const response = await BuscarProductos(parametrosFixed);
    set({ dataProductos: response });
    return response;
  },

  codigogenerado: 0,
  generarCodigo: () => {
    const response = Generarcodigo({ id: 2 });
    set({ codigogenerado: response });
  },

  aumentarPrecioSeleccion: async (p) => {
    const { error } = await supabase
      .rpc("aumentar_precio_seleccion", {
        _ids: p.ids,
        _valor: p.valor,            
        _es_porcentaje: p.esPorcentaje 
      });

    if (error) {
      console.error("Error al actualizar precios:", error);
      return false;
    }

    // Refrescar datos
    const { mostrarProductos, parametros } = get();
    if (parametros && parametros.id_empresa) {
      set(mostrarProductos(parametros));
    }
    return true;
  },
}));