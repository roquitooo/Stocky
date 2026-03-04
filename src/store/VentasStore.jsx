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

  descontarStockSinVenta: async (input) => {
    try {
      const payload =
        Array.isArray(input) ? { carrito: input } : (input ?? {});
      const carrito = Array.isArray(payload.carrito) ? payload.carrito : [];
      const descripcionFiado = String(payload?.descripcion || "").trim();
      const idCierreCaja = Number(payload?.id_cierre_caja);
      const idUsuario = Number(payload?.id_usuario);
      const idEmpresa = Number(payload?.id_empresa);
      let idMetodoPago = Number(payload?.id_metodo_pago);

      if (!Array.isArray(carrito) || carrito.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Carrito vacio",
          text: "Agrega productos antes de descontar stock.",
        });
        return { ok: false };
      }

      if (!Number.isFinite(idCierreCaja) || idCierreCaja <= 0) {
        Swal.fire({
          icon: "error",
          title: "Caja no detectada",
          text: "No hay un cierre de caja activo para registrar el fiado.",
        });
        return { ok: false };
      }

      if (!Number.isFinite(idMetodoPago) || idMetodoPago <= 0) {
        if (Number.isFinite(idEmpresa) && idEmpresa > 0) {
          const { data: metodosPagoData, error: metodosPagoError } = await supabase
            .from("metodos_pago")
            .select("id, nombre")
            .eq("id_empresa", idEmpresa);

          if (!metodosPagoError && Array.isArray(metodosPagoData)) {
            const metodoEfectivo = metodosPagoData.find((item) =>
              String(item?.nombre || "").toLowerCase().includes("efectivo")
            );
            const metodoFallback = metodoEfectivo ?? metodosPagoData[0];
            idMetodoPago = Number(metodoFallback?.id);
          }
        }
      }

      if (!Number.isFinite(idMetodoPago) || idMetodoPago <= 0) {
        Swal.fire({
          icon: "error",
          title: "Metodo de pago no disponible",
          text: "Configura al menos un metodo de pago para registrar fiados.",
        });
        return { ok: false };
      }

      const stockValido = await get().validarStockCarrito(carrito);
      if (!stockValido) {
        return { ok: false };
      }

      const idSucursal = carrito[0]?._id_sucursal ?? carrito[0]?.id_sucursal ?? null;
      if (!idSucursal) {
        Swal.fire({
          icon: "error",
          title: "Sucursal no detectada",
          text: "No se pudo detectar la sucursal activa para descontar stock.",
        });
        return { ok: false };
      }

      const porProducto = new Map();
      carrito.forEach((item) => {
        const idProducto = Number(item?._id_producto);
        const cantidad = Number(item?._cantidad ?? item?.cantidad ?? 0);
        const manejaInventario =
          item?.maneja_inventarios === true ||
          String(item?.maneja_inventarios).toLowerCase() === "true";

        if (!manejaInventario) return;
        if (!Number.isFinite(idProducto) || idProducto <= 0) return;
        if (!Number.isFinite(cantidad) || cantidad <= 0) return;

        const actual = porProducto.get(idProducto);
        porProducto.set(idProducto, {
          idProducto,
          nombre: item?.nombre || item?._descripcion || `Producto ${idProducto}`,
          cantidad: (actual?.cantidad || 0) + cantidad,
        });
      });

      const productos = Array.from(porProducto.values());
      if (productos.length === 0) {
        return { ok: true, actualizados: 0 };
      }

      const idsProductos = productos.map((p) => p.idProducto);
      const { data: stockRows, error: stockError } = await supabase
        .from("almacenes")
        .select("id, id_producto, stock")
        .eq("id_sucursal", idSucursal)
        .in("id_producto", idsProductos);

      if (stockError) {
        throw stockError;
      }

      const stockMap = new Map(
        (stockRows || []).map((row) => [Number(row.id_producto), row])
      );

      const faltantes = [];
      const updates = [];

      productos.forEach((producto) => {
        const row = stockMap.get(producto.idProducto);
        const stockActual = Number(row?.stock || 0);

        if (!row || producto.cantidad > stockActual) {
          faltantes.push({
            nombre: producto.nombre,
            solicitado: producto.cantidad,
            stock: stockActual,
          });
          return;
        }

        updates.push({
          idAlmacen: row.id,
          nuevoStock: stockActual - producto.cantidad,
        });
      });

      if (faltantes.length > 0) {
        const detalle = faltantes
          .map(
            (item) =>
              `- ${item.nombre} (Solicitado: ${item.solicitado} | Stock: ${item.stock})`
          )
          .join("<br>");

        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          html: `<div style="text-align:left">${detalle}</div>`,
        });
        return { ok: false };
      }

      for (const item of updates) {
        const { error: updateError } = await supabase
          .from("almacenes")
          .update({ stock: item.nuevoStock })
          .eq("id", item.idAlmacen);

        if (updateError) {
          throw updateError;
        }
      }

      const totalFiado = carrito.reduce((acc, item) => {
        const totalLinea = Number(item?._total);
        if (Number.isFinite(totalLinea) && totalLinea >= 0) {
          return acc + totalLinea;
        }

        const cantidad = Number(item?._cantidad ?? item?.cantidad ?? 0);
        const precioVenta = Number(item?._precio_venta ?? item?.precio_venta ?? 0);
        if (!Number.isFinite(cantidad) || !Number.isFinite(precioVenta)) {
          return acc;
        }
        return acc + Math.max(0, cantidad * precioVenta);
      }, 0);

      const productosDetalle = carrito
        .map((item) => {
          const nombre = item?._descripcion || item?.nombre || "Producto";
          const cantidad = Number(item?._cantidad ?? item?.cantidad ?? 0);
          if (!Number.isFinite(cantidad) || cantidad <= 0) return null;
          const cantidadTxt = Number.isInteger(cantidad)
            ? String(cantidad)
            : String(Number(cantidad.toFixed(2)));
          return `${nombre} x${cantidadTxt}`;
        })
        .filter(Boolean)
        .join(", ");

      const partesDescripcion = ["Fiado (solo stock)"];
      if (descripcionFiado) {
        partesDescripcion.push(`Motivo: ${descripcionFiado}`);
      }
      if (productosDetalle) {
        partesDescripcion.push(`Productos: ${productosDetalle}`);
      }

      const movimientoFiado = {
        fecha_movimiento: new Date().toISOString(),
        tipo_movimiento: "fiado",
        monto: Number.isFinite(totalFiado) ? totalFiado : 0,
        descripcion: partesDescripcion.join(" | "),
        id_metodo_pago: idMetodoPago,
        id_usuario: Number.isFinite(idUsuario) && idUsuario > 0 ? idUsuario : null,
        id_cierre_caja: idCierreCaja,
        id_ventas: null,
      };

      const { error: fiadoError } = await supabase
        .from("movimientos_caja")
        .insert(movimientoFiado);

      if (fiadoError) {
        return {
          ok: true,
          actualizados: updates.length,
          fiado_registrado: false,
          error_detalle: fiadoError?.message || null,
        };
      }

      return { ok: true, actualizados: updates.length, fiado_registrado: true };
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al descontar stock",
        text: error?.message || "No se pudo completar la operacion.",
      });
      return { ok: false, error };
    }
  },

  mostrarventasxsucursal: async (p) => {
    const response = await MostrarVentasXsucursal(p);
    set({ dataventas: response });
    set({ idventa: response?.id ? response?.id : 0 })
    return response;
  },

  // --- FUNCION DE VALIDACION (SOLO UNA VEZ) ---
  validarStockCarrito: async (carrito) => {
    if (!Array.isArray(carrito) || carrito.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrito vacio", text: "Agrega productos." });
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
        .map((p) => `- ${p.nombre} (Pides: ${p.falta + p.stock} | Hay: ${p.stock})`)
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
        const metodosUnicos = [
          ...new Set(
            movimientos
              .map((mov) => String(mov?.metodos_pago?.nombre || "").trim())
              .filter(Boolean)
          ),
        ];
        const metodo =
          metodosUnicos.length > 1
            ? "Mixto"
            : metodosUnicos[0] || "-";

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

