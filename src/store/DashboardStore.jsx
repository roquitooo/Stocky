import { create } from "zustand";

export const useDashboardStore = create((set, get) => ({
  fechaInicio: null,
  fechaFin: null,
  setRangoFechas: (inicio, fin) => set({ fechaInicio: inicio, fechaFin: fin }),
  limpiarFechas: ()=>set({fechaInicio:null,fechaFin:null})
}));
