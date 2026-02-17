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
  validarStockCarrito: async (carrito) => {
    if (!Array.isArray(carrito) || carrito.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrito vacío", text: "Agrega productos." });
      return false;
    }

    const idSucursal = carrito[0]?._id_sucursal ?? null;
    const idsProductos = [
      ...new Set(
        carrito
          .map((item) => item?._id_producto)
          .filter((id) => Number.isFinite(Number(id)))
      ),
    ];

    let stockActualPorProducto = new Map();
    if (idSucursal && idsProductos.length > 0) {
      try {
        const { data, error } = await supabase
          .from("almacenes")
          .select("id_producto, stock")
          .eq("id_sucursal", idSucursal)
          .in("id_producto", idsProductos);

        if (!error && Array.isArray(data)) {
          stockActualPorProducto = new Map(
            data.map((row) => [Number(row.id_producto), Number(row.stock || 0)])
          );
        }
      } catch (_) {
        // Fallback: si falla la consulta, validamos con el stock guardado en carrito.
      }
    }

    let productosSinStock = [];

    carrito.forEach((item) => {
      // 1. Leemos '_cantidad' (que es como viene del carrito)
      const cantidadSolicitada = parseFloat(item._cantidad || item.cantidad || 0);
      const idProducto = Number(item?._id_producto);
      const stockDesdeDb = stockActualPorProducto.get(idProducto);
      const stockActual = Number.isFinite(stockDesdeDb)
        ? stockDesdeDb
        : parseFloat(item.stock || 0);
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
        const productosMap = new Map();
        detalle.forEach((d) => {
          const nombre = d?.descripcion || d?.productos?.nombre;
          if (!nombre) return;
          const cantidad = Number(d?.cantidad || 0);
          productosMap.set(nombre, (productosMap.get(nombre) || 0) + cantidad);
        });
        const productos = productosMap.size
          ? Array.from(productosMap.entries())
              .map(([nombre, cantidad]) => {
                const cant = Number.isInteger(cantidad) ? cantidad : Number(cantidad.toFixed(2));
                return `${nombre} x${cant}`;
              })
              .join(", ")
          : "Sin detalle";
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
      let query = supabase
        .from("ventas")
        .select("monto_total")
        .eq("id_empresa", p.id_empresa)
        .neq("estado", "nueva");

      if (p?.fechaInicio) {
        query = query.gte("fecha", `${p.fechaInicio} 00:00:00`);
      }
      if (p?.fechaFin) {
        query = query.lte("fecha", `${p.fechaFin} 23:59:59`);
      }

      const { data, error } = await query;
      if (error || !Array.isArray(data)) return 0;

      return data.reduce((acc, item) => acc + Number(item?.monto_total || 0), 0);
    } catch (err) { return 0; }
  },

  totalGananciaNeta: async (p) => {
    try {
      let query = supabase
        .from("detalle_venta")
        .select(`
          cantidad,
          precio_venta,
          precio_compra,
          total,
          ventas!inner(id, id_empresa, estado, monto_total, sub_total, fecha)
        `)
        .eq("ventas.id_empresa", p.id_empresa)
        .neq("ventas.estado", "nueva");

      if (p?.fechaInicio) {
        query = query.gte("ventas.fecha", `${p.fechaInicio} 00:00:00`);
      }
      if (p?.fechaFin) {
        query = query.lte("ventas.fecha", `${p.fechaFin} 23:59:59`);
      }

      const { data, error } = await query;

      if (error || !Array.isArray(data)) return 0;

      const ventasMap = new Map();

      data.forEach((item) => {
        const ventaId = Number(item?.ventas?.id);
        if (!Number.isFinite(ventaId)) return;

        const cantidad = Number(item?.cantidad || 0);
        const precioVenta = Number(item?.precio_venta || 0);
        const precioCompra = Number(item?.precio_compra || 0);
        const totalLinea = Number(item?.total);
        const ingresoLinea = Number.isFinite(totalLinea)
          ? totalLinea
          : cantidad * precioVenta;
        const costoLinea = cantidad * precioCompra;

        if (!ventasMap.has(ventaId)) {
          ventasMap.set(ventaId, {
            ingresoBase: 0,
            costo: 0,
            montoTotalVenta: Number(item?.ventas?.monto_total),
          });
        }

        const venta = ventasMap.get(ventaId);
        venta.ingresoBase += Number(ingresoLinea || 0);
        venta.costo += Number(costoLinea || 0);
      });

      const total = Array.from(ventasMap.values()).reduce((acc, venta) => {
        const ingresoBase = Number(venta?.ingresoBase || 0);
        const costo = Number(venta?.costo || 0);
        const montoTotalVenta = Number(venta?.montoTotalVenta);

        // Prorratea descuentos/recargos de la venta completa sobre sus lineas.
        // Si no hay monto_total, usa el ingreso base como fallback.
        const factor =
          ingresoBase > 0 && Number.isFinite(montoTotalVenta)
            ? montoTotalVenta / ingresoBase
            : 1;

        const ingresoAjustado = ingresoBase * factor;
        return acc + (ingresoAjustado - costo);
      }, 0);

      return Number.isFinite(total) ? total : 0;
    } catch (err) {
      return 0;
    }
  },
}));
