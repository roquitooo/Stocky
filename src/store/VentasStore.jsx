import { create } from "zustand";
import {
  InsertarVentas,
  EliminarVentasIncompletas,
  MostrarVentasXsucursal,
} from "../supabase/crudVenta";
import { supabase } from "../supabase/supabase.config"; 
import Swal from "sweetalert2"; 

export const useVentasStore = create((set, get) => ({
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
    await EliminarVentasIncompletas(p);
  },

  mostrarventasxsucursal: async (p) => {
    const response = await MostrarVentasXsucursal(p);
    set({ dataventas: response });
    set({ idventa: response?.id ? response?.id : 0 })
    return response;
  },

  // --- FUNCIÓN DE VALIDACIÓN (SOLO UNA VEZ) ---
  validarStockCarrito: (carrito) => {
    if (!Array.isArray(carrito) || carrito.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrito vacío", text: "Agrega productos." });
      return false;
    }

    let productosSinStock = [];

    carrito.forEach((item) => {
      // 1. Leemos '_cantidad' (que es como viene del carrito)
      const cantidadSolicitada = parseFloat(item._cantidad || item.cantidad || 0);
      const stockActual = parseFloat(item.stock || 0);
      // 2. Convertimos el booleano
      const manejaInventario = String(item.maneja_inventarios) === "true";

      if (manejaInventario) {
          if (cantidadSolicitada > stockActual) {
            productosSinStock.push({
              nombre: item.nombre || item._descripcion, 
              falta: cantidadSolicitada - stockActual,
              stock: stockActual
            });
          }
      }
    });

    if (productosSinStock.length > 0) {
      const listaErrores = productosSinStock
        .map(p => `• ${p.nombre} (Pides: ${p.falta + p.stock} | Hay: ${p.stock})`)
        .join("<br>");

      Swal.fire({
        icon: "error",
        title: "Stock Insuficiente",
        html: `<div style="text-align: left;">
                No alcanza el stock para:<br><br>
                ${listaErrores}
               </div>`,
      });
      return false; // BLOQUEA LA VENTA
    }

    return true; // APRUEBA LA VENTA
  },

  // --- OTRAS FUNCIONES ---
  mostrarVentasRecientes: async (p) => {
    try {
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          id,
          fecha,
          monto_total,
          id_usuario,
          usuarios(nombres),
          detalle_venta(cantidad, descripcion, productos(nombre)),
          movimientos_caja(id_metodo_pago, metodos_pago(nombre))
        `)
        .eq("id_empresa", p._id_empresa)
        .neq("estado", "nueva")
        .order("fecha", { ascending: false })
        .limit(20);

      if (error) return [];

      const formatearFecha = (fechaIso) => {
        const d = new Date(fechaIso);
        if (Number.isNaN(d.getTime())) return "--";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, "0");
        const mi = String(d.getMinutes()).padStart(2, "0");
        return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
      };

      return (data || []).map((venta) => {
        const detalle = Array.isArray(venta.detalle_venta) ? venta.detalle_venta : [];
        const nombres = detalle
          .map((d) => d?.descripcion || d?.productos?.nombre)
          .filter(Boolean);
        const productos = nombres.length ? [...new Set(nombres)].join(", ") : "Sin detalle";
        const cantidad_total = detalle.reduce(
          (acc, d) => acc + Number(d?.cantidad || 0),
          0
        );

        const movimientos = Array.isArray(venta.movimientos_caja)
          ? venta.movimientos_caja
          : [];
        const metodo = movimientos?.[0]?.metodos_pago?.nombre || "-";

        return {
          id: venta.id,
          fecha: formatearFecha(venta.fecha),
          productos,
          cantidad_total,
          vendedor: venta?.usuarios?.nombres || "-",
          metodo,
          total: Number(venta.monto_total || 0),
        };
      });
    } catch (err) {
      return [];
    }
  },

  mostrarVentasGrafico: async (p) => {
    try {
      const { data, error } = await supabase
        .rpc("mostrarventasgrafico", { 
            _id_empresa: p.id_empresa,
            _fecha_inicio: p.fechaInicio,
            _fecha_fin: p.fechaFin
        });
      if (error) { return []; }
      return data;
    } catch (err) { return []; }
  },

  totalVentas: async (p) => {
    try {
      const { data, error } = await supabase
        .rpc("sumarventastotales", { _id_empresa: p.id_empresa });
      if (error) { return 0; }
      return data;
    } catch (err) { return 0; }
  },
}));
