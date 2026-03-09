import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useCierreCajaStore = create((set) => ({
  // ---------------------------------------------------------
  // ðŸ”½ PARTE VISUAL (LO QUE FALTABA)
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
  // ðŸ”½ PARTE BASE DE DATOS (LA QUE YA FUNCIONA)
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

  mostrarHistorialCierres: async (p) => {
    try {
      if (!p?.id_empresa) return [];

      const { data: sucursales, error: errorSucursales } = await supabase
        .from("sucursales")
        .select("id, nombre")
        .eq("id_empresa", p.id_empresa);

      if (errorSucursales || !Array.isArray(sucursales) || sucursales.length === 0) {
        return [];
      }

      const sucursalIds = sucursales.map((s) => s.id);
      const sucursalesMap = new Map(sucursales.map((s) => [s.id, s.nombre]));

      const { data: cajas, error: errorCajas } = await supabase
        .from("caja")
        .select("id, descripcion, id_sucursal")
        .in("id_sucursal", sucursalIds);

      if (errorCajas || !Array.isArray(cajas) || cajas.length === 0) {
        return [];
      }

      const cajaIds = cajas.map((c) => c.id);
      const cajasMap = new Map(cajas.map((c) => [c.id, c]));

      let query = supabase
        .from("cierrecaja")
        .select(`
          id,
          fechainicio,
          fechacierre,
          estado,
          id_caja,
          id_usuario,
          total_efectivo_calculado,
          total_efectivo_real,
          diferencia_efectivo,
          usuarios(nombres)
        `)
        .in("id_caja", cajaIds)
        .order("fechainicio", { ascending: false })
        .limit(p?.limit ?? 150);

      if (p?.fechaInicio) {
        query = query.gte("fechainicio", `${p.fechaInicio} 00:00:00`);
      }
      if (p?.fechaFin) {
        query = query.lte("fechainicio", `${p.fechaFin} 23:59:59`);
      }

      const { data: cierres, error: errorCierres } = await query;

      if (errorCierres || !Array.isArray(cierres)) {
        return [];
      }

      return cierres.map((item) => {
        const caja = cajasMap.get(item.id_caja);
        const sucursalNombre = caja ? sucursalesMap.get(caja.id_sucursal) : "-";

        return {
          ...item,
          caja_nombre: caja?.descripcion || "-",
          sucursal_nombre: sucursalNombre || "-",
          usuario_nombre: item?.usuarios?.nombres || "-",
        };
      });
    } catch (error) {
      console.error("Error al obtener historial de cierres:", error);
      return [];
    }
  },

  mostrarMovimientosPorCierre: async (p) => {
    try {
      if (!p?.id_cierre_caja) return [];

      let query = supabase
        .from("movimientos_caja")
        .select(`
          id,
          fecha_movimiento,
          tipo_movimiento,
          monto,
          descripcion,
          vuelto,
          id_ventas,
          usuarios(nombres),
          metodos_pago(nombre),
          ventas(
            nro_comprobante,
            sub_total,
            monto_total,
            detalle_venta(
              cantidad,
              descripcion,
              productos(nombre)
            )
          )
        `)
        .eq("id_cierre_caja", p.id_cierre_caja)
        .neq("tipo_movimiento", "fiado")
        .order("fecha_movimiento", { ascending: false });

      if (p?.fechaInicio) {
        query = query.gte("fecha_movimiento", `${p.fechaInicio} 00:00:00`);
      }
      if (p?.fechaFin) {
        query = query.lte("fecha_movimiento", `${p.fechaFin} 23:59:59`);
      }

      const { data, error } = await query;
      if (error || !Array.isArray(data)) return [];

      return data.map((item) => {
        const detalle = Array.isArray(item?.ventas?.detalle_venta)
          ? item.ventas.detalle_venta
          : [];
        const productosMap = new Map();
        detalle.forEach((d) => {
          const nombre = d?.descripcion || d?.productos?.nombre;
          if (!nombre) return;
          const cantidad = Number(d?.cantidad || 0);
          productosMap.set(nombre, (productosMap.get(nombre) || 0) + cantidad);
        });

        const productos_vendidos = productosMap.size
          ? Array.from(productosMap.entries())
              .map(([nombre, cantidad]) => {
                const cant = Number.isInteger(cantidad) ? cantidad : Number(cantidad.toFixed(2));
                return `${nombre} x${cant}`;
              })
              .join(", ")
          : "-";

        return {
          ...item,
          productos_vendidos,
          usuario_nombre: item?.usuarios?.nombres || "-",
          metodo_pago: item?.metodos_pago?.nombre || "-",
          comprobante: item?.ventas?.nro_comprobante || "-",
          descuento_monto:
            Number(item?.ventas?.sub_total || 0) > Number(item?.ventas?.monto_total || 0)
              ? Number(item?.ventas?.sub_total || 0) - Number(item?.ventas?.monto_total || 0)
              : 0,
          descuento_porcentaje:
            Number(item?.ventas?.sub_total || 0) > 0 &&
            Number(item?.ventas?.sub_total || 0) > Number(item?.ventas?.monto_total || 0)
              ? ((Number(item?.ventas?.sub_total || 0) - Number(item?.ventas?.monto_total || 0)) * 100) /
                Number(item?.ventas?.sub_total || 0)
              : 0,
        };
      });
    } catch (error) {
      console.error("Error al obtener movimientos por cierre:", error);
      return [];
    }
  },

  mostrarFiadosPorCierre: async (p) => {
    try {
      if (!p?.id_cierre_caja) return [];

      let query = supabase
        .from("movimientos_caja")
        .select(`
          id,
          fecha_movimiento,
          tipo_movimiento,
          monto,
          descripcion,
          usuarios(nombres)
        `)
        .eq("id_cierre_caja", p.id_cierre_caja)
        .eq("tipo_movimiento", "fiado")
        .order("fecha_movimiento", { ascending: false });

      if (p?.fechaInicio) {
        query = query.gte("fecha_movimiento", `${p.fechaInicio} 00:00:00`);
      }
      if (p?.fechaFin) {
        query = query.lte("fecha_movimiento", `${p.fechaFin} 23:59:59`);
      }

      const { data, error } = await query;
      if (error || !Array.isArray(data)) return [];

      return data.map((item) => ({
        ...item,
        usuario_nombre: item?.usuarios?.nombres || "-",
      }));
    } catch (error) {
      console.error("Error al obtener egresos de stock por cierre:", error);
      return [];
    }
  },
}));
