import { create } from "zustand";

const hoyISO = new Date().toISOString().slice(0, 10);
const mesActualISO = `${hoyISO.slice(0, 7)}-01`;

const obtenerMesAnteriorISO = (isoMesBase) => {
  const base = new Date(`${isoMesBase}T00:00:00`);
  if (Number.isNaN(base.getTime())) return mesActualISO;
  base.setMonth(base.getMonth() - 1);
  const yyyy = base.getFullYear();
  const mm = String(base.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}-01`;
};

export const useDashboardStore = create((set) => ({
  fechaInicio: hoyISO,
  fechaFin: hoyISO,
  comparacionActiva: false,
  mesCompararA: mesActualISO,
  mesCompararB: obtenerMesAnteriorISO(mesActualISO),
  setRangoFechas: (inicio, fin) => set({ fechaInicio: inicio, fechaFin: fin }),
  limpiarFechas: () =>
    set({
      fechaInicio: null,
      fechaFin: null,
      comparacionActiva: false,
    }),
  setComparacionMeses: ({ mesA, mesB }) =>
    set({
      comparacionActiva: true,
      mesCompararA: mesA,
      mesCompararB: mesB,
    }),
  limpiarComparacion: () => set({ comparacionActiva: false }),
}));
