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
  const { data } = await supabase.rpc(
    "mostrartop5productosmasvendidosxcantidad",
    p
  );
  return data;
}

export async function Mostrartop10productosmasvendidosxmonto(p) {
  const { data } = await supabase.rpc(
    "mostrartop10productosmasvendidosxmonto",
    p
  );
  return data;
}
