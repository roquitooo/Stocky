import { create } from "zustand";
import { BuscarUsuariosAsignados, MostrarSucursalCajaAsignada, MostrarUsuariosAsignados } from "../supabase/crudAsignacionCajaSucursal";
export const useAsignacionCajaSucursalStore = create((set) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  accion: "",
  setAccion: (p) => {
    set({ accion: p });
  },
  selectItem:null,
  setSelectItem: (p) => {
    set({ selectItem: p });
  },

  dataSucursalesAsignadas: null,
  sucursalesItemSelectAsignadas: null,
  mostrarSucursalCajaAsignada: async (p) => {
    const response = await MostrarSucursalCajaAsignada(p);
    set({ dataSucursalesAsignadas: response });
    set({ sucursalesItemSelectAsignadas: response });
    return response;
  },
  datausuariosAsignados: [],

  mostrarUsuariosAsignados:async(p) =>{
    const response = await MostrarUsuariosAsignados(p)
    set({datausuariosAsignados:response})
    return response
  },
  buscarUsuariosAsignados:async(p) =>{
    const response = await BuscarUsuariosAsignados(p)
    set({datausuariosAsignados:response})
    return response
  },
  
}));