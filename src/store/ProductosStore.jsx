import { create } from "zustand";
import {
  BuscarProductos,MostrarProductos,EliminarProductos,InsertarProductos,EditarProductos, Generarcodigo
} from "../index";

import { supabase } from "../supabase/supabase.config";

export const useProductosStore = create((set, get) => ({
  refetchs:null,
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataProductos: [],
  productosItemSelect: {
    id:1
  },
  parametros: {},
  mostrarProductos: async (p) => {
    const response = await MostrarProductos(p);
    set({ parametros: p });
    set({ dataProductos: response });
    set({ productosItemSelect: response[0] });
    set({refetchs:p.refetchs})
    return response;
  },
  selectProductos: (p) => {
   
    set({ productosItemSelect: p });

  },
  insertarProductos: async (p) => {
  const response=  await InsertarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
    return response;
  },
  eliminarProductos: async (p) => {
    await EliminarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
  },
  editarProductos: async (p) => {
    await EditarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
  },
  buscarProductos: async (p) => {
    const response = await BuscarProductos(p);
    set({ dataProductos: response });
    return response;
  },
  codigogenerado:0,
  generarCodigo:()=>{
  const response=  Generarcodigo({id:2})
  set({codigogenerado:response})
  },
  aumentarPrecioSeleccion: async (p) => {
    const { error } = await supabase
      .rpc("aumentar_precio_seleccion", { 
        _ids: p.ids, 
        _valor: p.valor,            // Antes era 'porcentaje', ahora es 'valor' genérico
        _es_porcentaje: p.esPorcentaje // Nuevo parámetro
      });
    
    if (error) {
      console.error("Error al actualizar precios:", error);
      return false;
    }
    
    // Refrescar datos
    const { mostrarProductos, parametros } = get();
    if(parametros && parametros.id_empresa) {
       set(mostrarProductos(parametros));
    }
    return true;
  },
}));