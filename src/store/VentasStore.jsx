import { create } from "zustand";
import {
  InsertarVentas,
  EliminarVentasIncompletas,
  MostrarVentasXsucursal,
} from "../index";
// IMPORTANTE: Asegúrate de que la ruta a supabase sea la correcta
import { supabase } from "../supabase/supabase.config"; 

export const useVentasStore = create((set) => ({
  porcentajeCambio: 0,
  dataventas: [],
  idventa: 0,
  
  resetearventas: () => set({ idventa: 0 }),

  insertarVentas: async (p) => {
    const result = await InsertarVentas(p);
    set({ idventa: result?.id });
    return result;
  },

  eliminarventasIncompletas: async (p) => {
    // await EliminarVentasIncompletas(p);
  },

  mostrarventasxsucursal: async (p) => {
    const response = await MostrarVentasXsucursal(p);
    set({ dataventas: response });
    set({ idventa: response?.id ? response?.id : 0 })
    return response;
  },

  // --- FUNCIÓN DE HISTORIAL ---
  mostrarVentasRecientes: async (p) => {
    const { data, error } = await supabase
      .rpc("mostrarventasrecientes", { _id_empresa: p._id_empresa }); // Este sí lleva guion bajo porque viene del parametro mapeado si lo usaras asi, pero dejemoslo consistente.
      // NOTA: Si esta función también falla, cambia p._id_empresa por p.id_empresa
    if (error) return [];
    return data;
  },

  mostrarVentasGrafico: async (p) => {
    try {
      const { data, error } = await supabase
        .rpc("mostrarventasgrafico", { 
            _id_empresa: p.id_empresa,
            _fecha_inicio: p.fechaInicio,  // <--- Nuevo parámetro
            _fecha_fin: p.fechaFin         // <--- Nuevo parámetro
        });
      
      if (error) {
        console.error("Error gráfico ventas:", error);
        return [];
      }
      return data;
    } catch (err) {
      console.error("Error store gráfico:", err);
      return [];
    }
  },

  // --- CORRECCIÓN AQUÍ: SUMAR TOTALES ---
  totalVentas: async (p) => {
    try {
      const { data, error } = await supabase
        .rpc("sumarventastotales", { 
            _id_empresa: p.id_empresa // <--- AQUÍ ESTABA EL ERROR. Debe ser p.id_empresa
        });
      
      if (error) {
        console.error("Error sumando ventas:", error);
        return 0;
      }
      return data;
    } catch (err) {
      console.error("Error store:", err);
      return 0;
    }
  },
}));