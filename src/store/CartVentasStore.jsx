import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useClientesProveedoresStore } from "./ClientesProveedoresStore";

const initialState = {
  items: [],
  subtotal: 0,
  total: 0,
  statePantallaCobro: false,
  tipocobro: "",
  stateMetodosPago: false,
  // Estados para descuento
  descuento: 0,
  tipoDescuento: "monto", // "monto" o "porcentaje"
};

// --- FUNCIÓN HELPER PARA CALCULAR TODO ---
// Recibe los items y la configuración de descuento, devuelve los nuevos valores
function calcularStateConDescuento(items, descuento, tipoDescuento) {
  const subtotal = items.reduce(
    (acc, item) => acc + item._precio_venta * item._cantidad,
    0
  );

  let totalFinal = subtotal;

  if (tipoDescuento === "porcentaje") {
    // Descuento porcentual (ej: 10%)
    totalFinal = subtotal - (subtotal * (descuento / 100));
  } else {
    // Descuento fijo (ej: $500)
    totalFinal = subtotal - descuento;
  }

  return {
    items,
    subtotal: subtotal,
    total: Math.max(0, totalFinal) // Evitamos totales negativos
  };
}

export const useCartVentasStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // --- ACCIÓN PARA APLICAR EL DESCUENTO DESDE EL INPUT ---
      aplicarDescuento: (valor, tipo) =>
        set((state) => {
          const nuevoDescuento = parseFloat(valor) || 0;
          // Recalculamos usando los items actuales
          return {
            descuento: nuevoDescuento,
            tipoDescuento: tipo,
            ...calcularStateConDescuento(state.items, nuevoDescuento, tipo)
          };
        }),

      addItem: (p) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item._id_producto === p._id_producto
          );
          let updatedItems;

          if (existingItem) {
            updatedItems = state.items.map((item) => {
              if (item._id_producto === p._id_producto) {
                const newQuantity = item._cantidad + (p._cantidad || 1);
                return {
                  ...item,
                  _cantidad: newQuantity,
                  _total: newQuantity * item._precio_venta,
                };
              }
              return item;
            });
          } else {
            updatedItems = [...state.items, p];
          }

          // Recalculamos totales respetando el descuento actual
          return calcularStateConDescuento(updatedItems, state.descuento, state.tipoDescuento);
        }),

      removeItem: (p) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item !== p);
          return calcularStateConDescuento(updatedItems, state.descuento, state.tipoDescuento);
        }),

      resetState: () => {
        const { selectCliPro } = useClientesProveedoresStore.getState();
        selectCliPro([]);
        set(initialState);
      },

      addcantidadItem: (p) =>
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item._id_producto === p._id_producto) {
              const updatedItem = { ...item, _cantidad: item._cantidad + 1 };
              updatedItem._total = updatedItem._cantidad * updatedItem._precio_venta;
              return updatedItem;
            }
            return item;
          });
          return calcularStateConDescuento(updatedItems, state.descuento, state.tipoDescuento);
        }),

      restarcantidadItem: (p) =>
        set((state) => {
          const updatedItems = state.items
            .map((item) => {
              if (item._id_producto === p._id_producto && item._cantidad > 0) {
                const updatedQuantity = item._cantidad - 1;
                if (updatedQuantity === 0) {
                  return null;
                } else {
                  const updatedItem = {
                    ...item,
                    _cantidad: updatedQuantity,
                  };
                  updatedItem._total = updatedItem._cantidad * updatedItem._precio_venta;
                  return updatedItem;
                }
              }
              return item;
            })
            .filter(Boolean);
          
          return calcularStateConDescuento(updatedItems, state.descuento, state.tipoDescuento);
        }),

      updateCantidadItem: (p, cantidad) =>
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item._id_producto === p._id_producto) {
              const updatedItem = {
                ...item,
                _cantidad: cantidad,
                _total: cantidad * item._precio_venta,
              };
              return updatedItem;
            }
            return item;
          });
          return calcularStateConDescuento(updatedItems, state.descuento, state.tipoDescuento);
        }),

      setStatePantallaCobro: (p) =>
        set((state) => {
          if (state.items.length === 0) {
            toast.warning("No hay productos en el carrito");
            return { state };
          } else {
            return {
              statePantallaCobro: !state.statePantallaCobro,
              tipocobro: p.tipocobro,
            };
          }
        }),

      setStateMetodosPago: () =>
        set((state) => ({ stateMetodosPago: !state.stateMetodosPago })),
    }),
    {
      name: "cart-ventas-storage",
    }
  )
);