import { create } from "zustand";
import {
  InsertarVentas,
  EliminarVentasIncompletas,
  MostrarVentasXsucursal,
} from "../index";
import { supabase } from "../supabase/supabase.config"; 
import Swal from "sweetalert2"; // <--- Necesitamos Swal aquí para la alerta

export const useVentasStore = create((set, get) => ({ // <--- Agregamos 'get'
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

  // --- NUEVA FUNCIÓN DE VALIDACIÓN (LA SOLUCIÓN) ---
  validarStockCarrito: (carrito) => {
    if (carrito.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrito vacío", text: "Agrega productos." });
      return false;
    }

    let productosSinStock = [];

    carrito.forEach((item) => {
      // 1. CORRECCIÓN CLAVE: Leemos '_cantidad' (que es como viene del carrito)
      // Si no existe, intentamos leer 'cantidad' por seguridad.
      const cantidadSolicitada = parseFloat(item._cantidad || item.cantidad || 0);
      
      const stockActual = parseFloat(item.stock || 0);
      
      // Convertimos el booleano (a veces viene como string "true" o boolean true)
      const manejaInventario = String(item.maneja_inventarios) === "true";

      if (manejaInventario) {
          // Log para depurar si lo necesitas
          // console.log(`Validando: ${item.nombre} | Pide: ${cantidadSolicitada} | Hay: ${stockActual}`);
          
          if (cantidadSolicitada > stockActual) {
            productosSinStock.push({
              nombre: item.nombre || item._descripcion, // Aseguramos mostrar un nombre
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

validarStockCarrito: (carrito) => {
    if (carrito.length === 0) {
      Swal.fire({ icon: "warning", title: "Carrito vacío", text: "Agrega productos." });
      return false;
    }

    let productosSinStock = [];

    carrito.forEach((item) => {
      // 1. CORRECCIÓN CLAVE: Leemos '_cantidad' (que es como viene del carrito)
      // Si no existe, intentamos leer 'cantidad' por seguridad.
      const cantidadSolicitada = parseFloat(item._cantidad || item.cantidad || 0);
      
      const stockActual = parseFloat(item.stock || 0);
      
      // Convertimos el booleano (a veces viene como string "true" o boolean true)
      const manejaInventario = String(item.maneja_inventarios) === "true";

      if (manejaInventario) {
          // Log para depurar si lo necesitas
          // console.log(`Validando: ${item.nombre} | Pide: ${cantidadSolicitada} | Hay: ${stockActual}`);
          
          if (cantidadSolicitada > stockActual) {
            productosSinStock.push({
              nombre: item.nombre || item._descripcion, // Aseguramos mostrar un nombre
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
  // ... (Resto de tus funciones: mostrarVentasRecientes, mostrarVentasGrafico, etc. siguen igual)
  mostrarVentasRecientes: async (p) => {
    const { data, error } = await supabase
      .rpc("mostrarventasrecientes", { _id_empresa: p._id_empresa });
    if (error) return [];
    return data;
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