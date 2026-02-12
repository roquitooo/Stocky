import { create } from "zustand";

import {
  MostrarPermisos,
  EliminarPermisos,
  MostrarPermisosDefault,
  InsertarPermisos,
  MostrarPermisosGlobales,
  MostrarPermisosConfiguracion,
} from "../supabase/crudPermisos";
export const usePermisosStore = create((set, get) => ({
  datapermisos: [],
  selectedModules: [],
  setSelectedModules: (p) => set({ selectedModules: p }),
  toggleModule: (moduleId) => {
    const { selectedModules } = get();
    const updatedModules = selectedModules.includes(moduleId)
      ? selectedModules.filter((id) => id !== moduleId)
      : [...selectedModules, moduleId];
    console.log("modulos check onchange", updatedModules);
    set({ selectedModules: updatedModules });
  },
  mostrarPermisos: async (p) => {
    const response = await MostrarPermisos(p);
    set({ datapermisos: response });
    return response;
  },
  mostrarPermisosDefault: async () => {
    const response = MostrarPermisosDefault();
    return response;
  },
  eliminarPermisos: async (p) => {
    await EliminarPermisos(p);
  },
  actualizarPermisos: async (p) => {
    // await EliminarPermisos(p)
    // await InsertarPermisos(p)
  },
  dataPermisosGlobales: null,          // 👈 antes []
  permisosGlobalesLoaded: false,  
  mostrarPermisosGlobales: async (p) => {
    const response = await MostrarPermisosGlobales(p);
    set({
      dataPermisosGlobales: response ?? [],
      permisosGlobalesLoaded: true,
    });
    return response;
  },
  dataPermisosConfiguracion:[],
  mostrarPermisosConfiguracion: async(p) =>{
    const response = await MostrarPermisosConfiguracion(p)
    set({dataPermisosConfiguracion:response})
    return response;
  }
}));