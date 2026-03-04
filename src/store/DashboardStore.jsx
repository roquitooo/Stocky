import { create } from "zustand";

const hoyISO = new Date().toISOString().slice(0, 10);

export const useDashboardStore = create((set) => ({
  fechaInicio: hoyISO,
  fechaFin: hoyISO,
  setRangoFechas: (inicio, fin) => set({ fechaInicio: inicio, fechaFin: fin }),
  limpiarFechas: ()=>set({fechaInicio:null,fechaFin:null})
}));
