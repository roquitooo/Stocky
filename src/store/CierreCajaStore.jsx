import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useCierreCajaStore = create((set) => ({
  // ---------------------------------------------------------
  // 🔽 PARTE VISUAL (LO QUE FALTABA)
  // ---------------------------------------------------------
  stateCierreCaja: false,
  setStateCierraCaja: (p) => set({ stateCierreCaja: p }),

  stateIngresoSalida: false,
  setStateIngresoSalida: (p) => set({ stateIngresoSalida: p }),

  stateConteoCaja: false,
  setStateConteoCaja: (p) => set({ stateConteoCaja: p }),

  tipoRegistro: "", // Para saber si es 'ingreso' o 'salida'
  setTipoRegistro: (p) => set({ tipoRegistro: p }),

  // ---------------------------------------------------------
  // 🔽 PARTE BASE DE DATOS (LA QUE YA FUNCIONA)
  // ---------------------------------------------------------
  dataCierreCaja: null,

  mostrarCierreCaja: async (p) => {
    try {
      if (!p.id_caja) return null;

      const { data, error } = await supabase
        .from("cierrecaja")
        .select("*")
        .eq("id_caja", p.id_caja)
        .eq("estado", 0)
        .order("id", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error al buscar cierre de caja:", error);
        return null;
      }

      const row = data?.[0] ?? null;
      set({ dataCierreCaja: row });
      return row;
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  aperturarCaja: async (p) => {
    try {
      if (!p?.id_caja) throw new Error("Falta id_caja");
      if (!p?.id_usuario) throw new Error("Falta id_usuario");

      // 1) Si ya hay una caja abierta, devolvemos esa (evita duplicados)
      const { data: abierta, error: errAbierta } = await supabase
        .from("cierrecaja")
        .select("*")
        .eq("id_caja", p.id_caja)
        .eq("estado", 0)
        .order("id", { ascending: false })
        .limit(1);

      if (errAbierta) throw errAbierta;

      if (abierta?.length) {
        set({ dataCierreCaja: abierta[0] });
        return abierta[0];
      }

      // 2) Abrimos la caja
      const { data, error } = await supabase
        .from("cierrecaja")
        .insert({
          fechainicio: new Date().toISOString(),
          fechacierre: null, 
          estado: 0,
          id_caja: p.id_caja,
          id_usuario: p.id_usuario,
          total_efectivo_calculado: p.monto_inicial ?? 0,
          total_efectivo_real: 0,
          diferencia_efectivo: 0,
        })
        .select("*")
        .single();

      if (error) throw error;

      set({ dataCierreCaja: data });
      return data;
    } catch (error) {
      console.error("Error al abrir caja:", error);
      throw error; 
    }
  },

  cerrarCaja: async (p) => {
    try {
      const idCierre = p.id_cierre_caja ?? p.id;
      if (!idCierre) throw new Error("Falta id_cierre_caja");

      const { error } = await supabase
        .from("cierrecaja")
        .update({
          fechacierre: new Date().toISOString(),
          estado: 1,
          total_efectivo_real: p.total_efectivo_real,
          total_efectivo_calculado: p.total_efectivo_calculado,
          diferencia_efectivo: p.diferencia_efectivo,
        })
        .eq("id", idCierre);

      if (error) throw error;
      set({ dataCierreCaja: null });
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      throw error;
    }
  },

  // Compatibilidad con componentes que aun llaman este nombre.
  cerrarTurnoCaja: async (p) => {
    const { cerrarCaja } = useCierreCajaStore.getState();
    return cerrarCaja(p);
  },
}));
