import { create } from "zustand";
import { supabase } from "../supabase/supabase.config"; // Importamos supabase para llamar al RPC
import { InsertarCaja, EditarCaja, EliminarCaja } from "../supabase/crudCaja";

export const useCajasStore = create((set) => ({
  stateCaja: false,
  setStateCaja: (p) => set({ stateCaja: p }),
  accion: "",
  setAccion: (p) => set({ accion: p }),
  
  cajaSelectItem: null, // Inicializamos en null (más seguro que [])
  setCajaSelectItem: (p) => {
    set({ cajaSelectItem: p });
  },
  
  dataCaja: [], // Inicializamos como array vacío

mostrarCajaXSucursal: async (p) => {
    try {
      // TRUCO: Mapeamos el parámetro. 
      // El POS envía { id_sucursal: 1865 }, pero SQL espera { p_id_sucursal: 1865 }
      const parametrosParaSQL = { p_id_sucursal: p.id_sucursal };

      const { data, error } = await supabase.rpc("mostrarcajaxsucursal", parametrosParaSQL);
      
      if (error) {
        // Si hay error técnico, lo mostramos en consola
        console.error("Error RPC Cajas:", error);
        return [];
      }

      if (data && data.length > 0) {
        set({ cajaSelectItem: data[0] });
        set({ dataCaja: data });
        return data;
      } 
      
      // Si no devuelve nada
      console.warn("La función SQL funcionó, pero no encontró cajas para la sucursal:", p.id_sucursal);
      set({ cajaSelectItem: null });
      set({ dataCaja: [] });
      return [];

    } catch (error) {
      console.error("Crash Store:", error);
      return [];
    }
  },

  insertarCaja: async (p) => {
    await InsertarCaja(p);
  },
  editarCaja: async (p) => {
    await EditarCaja(p);
  },
  eliminarCaja: async (p) => {
    await EliminarCaja(p);
  },
}));