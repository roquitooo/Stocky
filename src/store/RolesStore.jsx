import { create } from "zustand";
import { MostrarRoles } from "../supabase/crudRol"; // Asegúrate de que esta ruta sea correcta

export const useRolesStore = create((set) => ({
  rolesItemSelect: [],
  
  // --- CORRECCIÓN: Agregamos la función que busca 'RegistrarUsuarios' ---
  selectRol: (p) => {
    set({ rolesItemSelect: p });
  },
  // ---------------------------------------------------------------------

  // Mantenemos la anterior por si la usas en otro lado
  setRolesItemSelect: (p) => {
    set({ rolesItemSelect: p });
  },

  mostrarRoles: async (p) => {
    const response = await MostrarRoles(p);
    // Seleccionamos el primer rol solo si no hay uno ya seleccionado.
    const current = useRolesStore.getState().rolesItemSelect;
    if (response && response.length > 0 && !current?.id) {
      set({
        rolesItemSelect: response[0],
      });
    }
    return response;
  },
}));
