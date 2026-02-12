import { create } from "zustand";
import {
  MostrarSucursalesAsignadasXuser,
  MostrarSucursales,
} from "../supabase/crudSucursales";

export const useSucursalesStore = create((set, get) => ({
  // ✅ lista de sucursales
  dataSucursales: [],
  stateSucursales: [], // lo dejo para compatibilidad si en otro lado lo usan

  // ✅ sucursal seleccionada (OBJETO, no array)
  sucursalesItemSelect: null,

  // ✅ setear selección manual
  selectSucursal: (sucursal) => set({ sucursalesItemSelect: sucursal }),

  // ✅ traer sucursales asignadas al usuario
  mostrarSucursalesAsignadas: async (p) => {
    const response = (await MostrarSucursalesAsignadasXuser(p)) ?? [];
    const currentSelected = get().sucursalesItemSelect;

    set({
      dataSucursales: response,
      stateSucursales: response,
      // si no hay selección aún, selecciono la primera para evitar undefined
      sucursalesItemSelect: currentSelected?.id ? currentSelected : response[0] ?? null,
    });

    return response;
  },

  // ✅ traer todas las sucursales de la empresa
  mostrarSucursales: async (p) => {
    const response = (await MostrarSucursales(p)) ?? [];
    const currentSelected = get().sucursalesItemSelect;

    set({
      dataSucursales: response,
      stateSucursales: response,
      sucursalesItemSelect: currentSelected?.id ? currentSelected : response[0] ?? null,
    });

    return response;
  },
}));
