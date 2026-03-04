import { create } from "zustand";
import {
  InsertarMovCaja,
  Mostrarmovimientoscajalive,
  MostrarVentasMetodoPagoMovCaja,
} from "../supabase/crudMovimientosCaja";
import { supabase } from "../supabase/supabase.config";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizarMetodo = (item) =>
  item?.metodo_pago ?? item?.metodos_pago?.nombre ?? item?.nombre ?? "";

const metodoKey = (item) =>
  String(normalizarMetodo(item))
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const esMetodoEfectivo = (item) => metodoKey(item).includes("efectivo");

const esMetodoTarjeta = (item) => {
  const key = metodoKey(item);
  return key.includes("tarjeta") || key.includes("debito");
};

export const useMovCajaStore = create((set, get) => ({
  totalVentasMetodoPago: 0,
  totalVentasEfectivo: 0,
  totalVentasTarjeta: 0,
  totalAperturaCaja: 0,
  totalGastosVariosCaja: 0,
  totalIngresosVariosCaja: 0,
  totalGastosVariosTarjeta: 0,
  totalIngresosVariosTarjeta: 0,
  totalEfectivoCajaSinVentas: 0,
  totalEfectivoTotalCaja: 0,
  updateTotalEfectivoTotalCaja: () => {
    const { totalEfectivoCajaSinVentas, totalVentasEfectivo } = get();
    const total = totalEfectivoCajaSinVentas + totalVentasEfectivo;
    set({ totalEfectivoTotalCaja: total });
  },
  setTotalEfectivoCajaSinVentas: (p) => {
    set({ totalEfectivoCajaSinVentas: p });
    get().updateTotalEfectivoTotalCaja(); //recalcular el total
  },
  setTotalVentasEfectivo: (p) => {
    set({ totalVentasEfectivo: p });
    get().updateTotalEfectivoTotalCaja(); //recalcular el total
  },

  insertarMovCaja: async (p) => {
    await InsertarMovCaja(p);
  },
  mostrarEfectivoSinVentasMovcierrecaja: async (p) => {
    const idCierreCaja = p?._id_cierre_caja;
    if (!idCierreCaja) {
      set({
        totalAperturaCaja: 0,
        totalIngresosVariosCaja: 0,
        totalGastosVariosCaja: 0,
        totalIngresosVariosTarjeta: 0,
        totalGastosVariosTarjeta: 0,
        totalEfectivoCajaSinVentas: 0,
        totalEfectivoTotalCaja: 0,
      });
      return [];
    }

    const { data, error } = await supabase
      .from("movimientos_caja")
      .select("tipo_movimiento, monto, id_ventas, metodos_pago(nombre)")
      .eq("id_cierre_caja", idCierreCaja)
      .is("id_ventas", null)
      .in("tipo_movimiento", ["apertura", "ingreso", "salida"]);

    if (error) {
      throw new Error(error.message);
    }

    const result = Array.isArray(data) ? data : [];
    const movimientosEfectivo = result.filter(
      (item) => esMetodoEfectivo(item)
    );
    const movimientosTarjeta = result.filter(
      (item) => esMetodoTarjeta(item)
    );
    // Filtrar solo los movimientos de tipo "apertura"
    const movimientosApertura = movimientosEfectivo.filter(
      (item) => item.tipo_movimiento === "apertura"
    );
    // Sumar la columna "monto" solo para los movimientos de tipo "apertura"
    const totalApertura = movimientosApertura.reduce(
      (total, item) => total + toNumber(item.monto),
      0
    );
    set({ totalAperturaCaja: totalApertura });

    // Filtrar solo los movimientos de tipo "ingreso"
    const movimientosIngreso = movimientosEfectivo.filter(
      (item) => item.tipo_movimiento === "ingreso"
    );
    const totalIngreso = movimientosIngreso.reduce(
      (total, item) => total + toNumber(item.monto),
      0
    );
    set({ totalIngresosVariosCaja: totalIngreso });

    // Filtrar solo los movimientos de tipo "salida"
    const movimientosSalida = movimientosEfectivo.filter(
      (item) => item.tipo_movimiento === "salida"
    );
    // Sumar la columna "monto" solo para los movimientos de tipo "salida"
    const totalSalida = movimientosSalida.reduce(
      (total, item) => total + toNumber(item.monto),
      0
    );
    set({ totalGastosVariosCaja: totalSalida });

    const ingresosTarjeta = movimientosTarjeta
      .filter((item) => item.tipo_movimiento === "ingreso")
      .reduce((total, item) => total + toNumber(item.monto), 0);
    const gastosTarjeta = movimientosTarjeta
      .filter((item) => item.tipo_movimiento === "salida")
      .reduce((total, item) => total + toNumber(item.monto), 0);
    set({
      totalIngresosVariosTarjeta: ingresosTarjeta,
      totalGastosVariosTarjeta: gastosTarjeta,
    });

    const totalEfectivoCajaSinVentas =
      totalApertura + totalIngreso - totalSalida;
    set({ totalEfectivoCajaSinVentas: totalEfectivoCajaSinVentas });
    get().setTotalEfectivoCajaSinVentas(totalEfectivoCajaSinVentas);
    return result;
  },
  mostrarVentasMetodoPagoMovCaja: async (p) => {
    const ventasRaw = await MostrarVentasMetodoPagoMovCaja(p);
    const ventasPorMetodo = Array.isArray(ventasRaw) ? ventasRaw : [];
    const totalEfectivo = ventasPorMetodo
      .filter((item) => esMetodoEfectivo(item))
      .reduce((total, item) => total + toNumber(item.monto), 0);
    const totalTarjeta = ventasPorMetodo
      .filter((item) => esMetodoTarjeta(item))
      .reduce((total, item) => total + toNumber(item.monto), 0);
    const totalMonto = ventasPorMetodo.reduce(
      (total, item) => total + toNumber(item.monto),
      0
    );

    set({
      totalVentasMetodoPago: totalMonto,
      totalVentasEfectivo: totalEfectivo,
      totalVentasTarjeta: totalTarjeta,
    });
    get().setTotalVentasEfectivo(totalEfectivo);
    return ventasPorMetodo;
  },
  mostrarmovimientoscajalive: async (p) => {
    const response = await Mostrarmovimientoscajalive(p);
    return response;
  },
}));
