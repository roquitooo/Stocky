import Swal from "sweetalert2";
import { supabase } from "../supabase/supabase.config";

const tabla = "detalle_venta";

export async function InsertarDetalleVentas(p) {
  // 1. Validamos que tengamos sucursal antes de enviar
  // Si no viene en 'p', intentamos recuperarlo de donde sea, o fallamos antes de la DB
  const idSucursalFinal = p._id_sucursal || p.id_sucursal;

  if (!idSucursalFinal) {
    console.error("⛔ ERROR CRÍTICO: Se intentó vender sin ID de Sucursal.");
    return; 
  }

  // 2. Construimos el objeto MANUALMENTE para garantizar que la estructura coincida con SQL
  const { error } = await supabase.rpc("insertardetalleventa", {
    _id_venta: p._id_venta,
    _cantidad: p._cantidad,
    _precio_venta: p._precio_venta,
    _total: p._total,
    _descripcion: p._descripcion,
    _id_producto: p._id_producto,
    _precio_compra: p._precio_compra,
    _id_sucursal: idSucursalFinal // <--- AQUÍ ESTÁ LA MAGIA
  });

  if (error) {
    console.error("Error RPC InsertarDetalleVentas:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...detalle venta",
      text: error.message,
    });
    return;
  }
}

export async function MostrarDetalleVenta(p) {
  const { data, error } = await supabase.rpc("mostrardetalleventa", {
    _id_venta: p.id_venta,
  });
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...detalle venta",
      text: error.message,
    });
    return;
  }
  return data;
}

export async function EliminarDetalleVentas(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);
  if (error) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: error.message,
    });
    return;
  }
}

export async function Mostrartop5productosmasvendidosxcantidad(p) {
  try {
    let query = supabase
      .from("detalle_venta")
      .select(`
        cantidad,
        id_producto,
        productos(nombre, sevende_por),
        ventas!inner(id_empresa, estado, fecha)
      `)
      .eq("ventas.id_empresa", p?._id_empresa)
      .neq("ventas.estado", "nueva");

    if (p?._fecha_inicio) {
      query = query.gte("ventas.fecha", `${p._fecha_inicio} 00:00:00`);
    }
    if (p?._fecha_fin) {
      query = query.lte("ventas.fecha", `${p._fecha_fin} 23:59:59`);
    }

    const { data, error } = await query;
    if (error || !Array.isArray(data)) return [];

    const agrupado = new Map();

    data.forEach((row) => {
      const producto = row?.productos;
      const tipoVenta = String(producto?.sevende_por || "").toUpperCase();
      if (tipoVenta !== "UNIDAD") return;

      const key = row?.id_producto || producto?.nombre || "producto";
      const nombre = producto?.nombre || "Producto";
      const cantidad = Number(row?.cantidad || 0);
      agrupado.set(key, {
        nombre_producto: nombre,
        total_vendido: (agrupado.get(key)?.total_vendido || 0) + cantidad,
      });
    });

    const lista = Array.from(agrupado.values())
      .sort((a, b) => b.total_vendido - a.total_vendido)
      .slice(0, 5);

    const totalTop = lista.reduce((acc, item) => acc + Number(item.total_vendido || 0), 0);

    return lista.map((item) => ({
      nombre_producto: item.nombre_producto,
      total_vendido: Number.isInteger(item.total_vendido)
        ? item.total_vendido
        : Number(item.total_vendido.toFixed(2)),
      porcentaje:
        totalTop > 0
          ? Number(((Number(item.total_vendido || 0) * 100) / totalTop).toFixed(2))
          : 0,
    }));
  } catch (error) {
    return [];
  }
}

export async function Mostrartop10productosmasvendidosxmonto(p) {
  const { data } = await supabase.rpc(
    "mostrartop10productosmasvendidosxmonto",
    p
  );
  return data;
}
