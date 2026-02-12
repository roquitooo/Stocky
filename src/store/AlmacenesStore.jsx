import { create } from "zustand";
import {
  EliminarAlmacen,
  InsertarStockAlmacen,
  MostrarStockAlmacenXSucursal,
  MostrarAlmacenXSucursal
} from "../index";
// 1. IMPORTANTE: Importamos supabase para conectar con la base de datos
import { supabase } from "../supabase/supabase.config";

export const useAlmacenesStore = create((set, get) => ({
  dataalmacen: null,
  dataalmacenxsucursalxproducto: [],
  
  mostrarAlmacen: async (p) => {
    const response = await MostrarStockAlmacenXSucursal(p);
    set({ dataalmacen: response });
    return response;
  },
  
  mostrarAlmacenXsucursal: async (p) => {
    const response = await MostrarAlmacenXSucursal(p);
    set({ dataalmacenxsucursalxproducto: response });
    const { dataalmacenxsucursalxproducto } = get();
    return dataalmacenxsucursalxproducto;
  },
  
  insertarStockAlmacenes: async (p) => {
    await InsertarStockAlmacen(p);
  },
  
  eliminarAlmacen: async (p) => {
    await EliminarAlmacen(p);
  },

  editarStock: async (p) => {
    await supabase.rpc("editarstockalmacen", p);
  },

  // 2. NUEVA FUNCIÓN PARA EL DASHBOARD (Bajo Stock)
  contarProductosBajoStock: async (p) => {
    try {
      const { data, error } = await supabase
        .rpc("contarproductosbajostock", { _id_empresa: p.id_empresa });
      
      if (error) {
        console.error("Error al contar bajo stock:", error);
        return 0;
      }
      return data; // Retorna el número (ej: 5, 20, 0)
    } catch (err) {
      console.error("Error en store almacenes:", err);
      return 0;
    }
  }
}));