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

function normalizarCantidadEntera(valor, opciones = {}) {
  const { fallback = 1, minimo = 1 } = opciones;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return fallback;
  return Math.max(minimo, Math.trunc(numero));
}

function normalizarPrecio(valor) {
  const precio = Number(valor);
  return Number.isFinite(precio) ? precio : 0;
}

// Recibe los items y la configuracion de descuento, devuelve los nuevos valores
function calcularStateConDescuento(items, descuento, tipoDescuento) {
  const itemsNormalizados = items.map((item) => {
    const cantidad = normalizarCantidadEntera(item?._cantidad, {
      fallback: 1,
      minimo: 1,
    });
    const precioVenta = normalizarPrecio(item?._precio_venta);

    return {
      ...item,
      _cantidad: cantidad,
      _total: cantidad * precioVenta,
    };
  });

  const subtotal = itemsNormalizados.reduce(
    (acc, item) => acc + normalizarPrecio(item._precio_venta) * item._cantidad,
    0
  );

  let totalFinal = subtotal;

  if (tipoDescuento === "porcentaje") {
    totalFinal = subtotal - subtotal * (descuento / 100);
  } else {
    totalFinal = subtotal - descuento;
  }

  return {
    items: itemsNormalizados,
    subtotal,
    total: Math.max(0, totalFinal),
  };
}

export const useCartVentasStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      aplicarDescuento: (valor, tipo) =>
        set((state) => {
          const nuevoDescuento = parseFloat(valor) || 0;
          return {
            descuento: nuevoDescuento,
            tipoDescuento: tipo,
            ...calcularStateConDescuento(state.items, nuevoDescuento, tipo),
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
                const cantidadActual = normalizarCantidadEntera(item._cantidad, {
                  fallback: 1,
                  minimo: 1,
                });
                const incremento = normalizarCantidadEntera(p._cantidad, {
                  fallback: 1,
                  minimo: 1,
                });
                const newQuantity = cantidadActual + incremento;

                return {
                  ...item,
                  _cantidad: newQuantity,
                  _total: newQuantity * normalizarPrecio(item._precio_venta),
                };
              }
              return item;
            });
          } else {
            const cantidadNueva = normalizarCantidadEntera(p._cantidad, {
              fallback: 1,
              minimo: 1,
            });
            const precioVenta = normalizarPrecio(p._precio_venta);

            updatedItems = [
              ...state.items,
              {
                ...p,
                _cantidad: cantidadNueva,
                _total: cantidadNueva * precioVenta,
              },
            ];
          }

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento
          );
        }),

      removeItem: (p) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item !== p);
          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento
          );
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
              const cantidadActual = normalizarCantidadEntera(item._cantidad, {
                fallback: 1,
                minimo: 1,
              });
              const updatedItem = { ...item, _cantidad: cantidadActual + 1 };
              updatedItem._total =
                updatedItem._cantidad * normalizarPrecio(updatedItem._precio_venta);
              return updatedItem;
            }
            return item;
          });
          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento
          );
        }),

      restarcantidadItem: (p) =>
        set((state) => {
          const updatedItems = state.items
            .map((item) => {
              const cantidadActual = normalizarCantidadEntera(item._cantidad, {
                fallback: 0,
                minimo: 0,
              });

              if (item._id_producto === p._id_producto && cantidadActual > 0) {
                const updatedQuantity = cantidadActual - 1;
                if (updatedQuantity === 0) {
                  return null;
                }

                const updatedItem = {
                  ...item,
                  _cantidad: updatedQuantity,
                };
                updatedItem._total =
                  updatedItem._cantidad * normalizarPrecio(updatedItem._precio_venta);
                return updatedItem;
              }

              return item;
            })
            .filter(Boolean);

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento
          );
        }),

      updateCantidadItem: (p, cantidad) =>
        set((state) => {
          const cantidadNormalizada = normalizarCantidadEntera(cantidad, {
            fallback: 1,
            minimo: 1,
          });

          const updatedItems = state.items.map((item) => {
            if (item._id_producto === p._id_producto) {
              const updatedItem = {
                ...item,
                _cantidad: cantidadNormalizada,
                _total:
                  cantidadNormalizada * normalizarPrecio(item._precio_venta),
              };
              return updatedItem;
            }
            return item;
          });

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento
          );
        }),

      setStatePantallaCobro: (p) =>
        set((state) => {
          if (state.items.length === 0) {
            toast.warning("No hay productos en el carrito");
            return { state };
          }

          return {
            statePantallaCobro: !state.statePantallaCobro,
            tipocobro: p.tipocobro,
          };
        }),

      setStateMetodosPago: () =>
        set((state) => ({ stateMetodosPago: !state.stateMetodosPago })),
    }),
    {
      name: "cart-ventas-storage",
    }
  )
);
