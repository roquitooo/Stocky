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
  // Estados para recargo
  recargo: 0,
  tipoRecargo: "monto", // "monto" o "porcentaje"
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

function normalizarTipoAjuste(valor) {
  return valor === "descuento" ? "descuento" : "recargo";
}

function normalizarModoAjuste(valor) {
  return valor === "monto" ? "monto" : "porcentaje";
}

function normalizarValorAjuste(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) return 0;
  return numero;
}

function calcularTotalLinea(item) {
  const cantidad = normalizarCantidadEntera(item?._cantidad, {
    fallback: 1,
    minimo: 1,
  });
  const precioVenta = normalizarPrecio(item?._precio_venta);
  const base = cantidad * precioVenta;
  const tipoAjuste = normalizarTipoAjuste(item?._ajuste_tipo);
  const modoAjuste = normalizarModoAjuste(item?._ajuste_modo);
  const valorAjuste = normalizarValorAjuste(item?._ajuste_valor);

  const ajuste = modoAjuste === "porcentaje" ? base * (valorAjuste / 100) : valorAjuste;
  const totalLinea = tipoAjuste === "recargo" ? base + ajuste : base - ajuste;

  return Math.max(0, totalLinea);
}

// Recibe los items y la configuracion de ajustes, devuelve los nuevos valores
function calcularStateConDescuento(items, descuento, tipoDescuento, recargo, tipoRecargo) {
  const itemsNormalizados = items.map((item) => {
    const cantidad = normalizarCantidadEntera(item?._cantidad, {
      fallback: 1,
      minimo: 1,
    });
    const precioVenta = normalizarPrecio(item?._precio_venta);
    const ajusteTipo = normalizarTipoAjuste(item?._ajuste_tipo);
    const ajusteModo = normalizarModoAjuste(item?._ajuste_modo);
    const ajusteValor = normalizarValorAjuste(item?._ajuste_valor);

    const itemNormalizado = {
      ...item,
      _cantidad: cantidad,
      _precio_venta: precioVenta,
      _ajuste_tipo: ajusteTipo,
      _ajuste_modo: ajusteModo,
      _ajuste_valor: ajusteValor,
    };

    return {
      ...itemNormalizado,
      _total: calcularTotalLinea(itemNormalizado),
    };
  });

  const subtotal = itemsNormalizados.reduce(
    (acc, item) => acc + normalizarPrecio(item._total),
    0
  );

  const descuentoSeguro = normalizarValorAjuste(descuento);
  const recargoSeguro = normalizarValorAjuste(recargo);
  const descuentoFinal =
    tipoDescuento === "porcentaje"
      ? subtotal * (descuentoSeguro / 100)
      : descuentoSeguro;
  const recargoFinal =
    tipoRecargo === "porcentaje"
      ? subtotal * (recargoSeguro / 100)
      : recargoSeguro;

  const totalFinal = subtotal + recargoFinal - descuentoFinal;

  return {
    items: itemsNormalizados,
    subtotal,
    total: Math.max(0, totalFinal),
  };
}

export const useCartVentasStore = create(
  persist(
    (set) => ({
      ...initialState,

      aplicarDescuento: (valor, tipo) =>
        set((state) => {
          const nuevoDescuento = parseFloat(valor) || 0;
          return {
            descuento: nuevoDescuento,
            tipoDescuento: tipo,
            ...calcularStateConDescuento(
              state.items,
              nuevoDescuento,
              tipo,
              state.recargo,
              state.tipoRecargo
            ),
          };
        }),

      aplicarRecargo: (valor, tipo) =>
        set((state) => {
          const nuevoRecargo = parseFloat(valor) || 0;
          return {
            recargo: nuevoRecargo,
            tipoRecargo: tipo,
            ...calcularStateConDescuento(
              state.items,
              state.descuento,
              state.tipoDescuento,
              nuevoRecargo,
              tipo
            ),
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
                _precio_venta: precioVenta,
                _ajuste_tipo: "recargo",
                _ajuste_modo: "porcentaje",
                _ajuste_valor: 0,
              },
            ];
          }

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
          );
        }),

      removeItem: (p) =>
        set((state) => {
          const updatedItems = state.items.filter((item) => item !== p);
          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
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
              return { ...item, _cantidad: cantidadActual + 1 };
            }
            return item;
          });
          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
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
                return updatedItem;
              }

              return item;
            })
            .filter(Boolean);

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
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
              };
              return updatedItem;
            }
            return item;
          });

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
          );
        }),

      updateAjusteItem: (p, ajuste = {}) =>
        set((state) => {
          const updatedItems = state.items.map((item) => {
            if (item._id_producto !== p._id_producto) return item;

            return {
              ...item,
              _ajuste_tipo: normalizarTipoAjuste(ajuste.tipo ?? item._ajuste_tipo),
              _ajuste_modo: normalizarModoAjuste(ajuste.modo ?? item._ajuste_modo),
              _ajuste_valor: normalizarValorAjuste(ajuste.valor ?? item._ajuste_valor),
            };
          });

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
          );
        }),

      syncStockData: (productos = []) =>
        set((state) => {
          if (!Array.isArray(productos) || productos.length === 0 || state.items.length === 0) {
            return state;
          }

          const productosById = new Map(
            productos.map((producto) => [String(producto?.id ?? ""), producto])
          );

          let huboCambios = false;
          const updatedItems = state.items.map((item) => {
            const productoActualizado = productosById.get(String(item?._id_producto ?? ""));
            if (!productoActualizado) return item;

            const stockActualizado = productoActualizado?.stock ?? item?.stock;
            const stockMinimoActualizado =
              productoActualizado?.stock_minimo ??
              productoActualizado?._stock_minimo ??
              productoActualizado?.stockminimo ??
              item?.stock_minimo ??
              0;
            const manejaInventarioActualizado =
              productoActualizado?.maneja_inventarios ?? item?.maneja_inventarios;

            const cambioStock = item?.stock !== stockActualizado;
            const cambioStockMinimo = item?.stock_minimo !== stockMinimoActualizado;
            const cambioManejaInventario =
              item?.maneja_inventarios !== manejaInventarioActualizado;

            if (!cambioStock && !cambioStockMinimo && !cambioManejaInventario) {
              return item;
            }

            huboCambios = true;
            return {
              ...item,
              stock: stockActualizado,
              stock_minimo: stockMinimoActualizado,
              maneja_inventarios: manejaInventarioActualizado,
            };
          });

          if (!huboCambios) return state;

          return calcularStateConDescuento(
            updatedItems,
            state.descuento,
            state.tipoDescuento,
            state.recargo,
            state.tipoRecargo
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
