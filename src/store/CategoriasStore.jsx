import { create } from "zustand";
import { InsertarCategorias, MostrarCategorias } from "../index";

export const useCategoriasStore = create((set, get) => ({
    buscador: "",
    setBuscador: (p) => {
        set({ buscador: p });
    },
    datacategorias: [],
    categoriaItemSelect: [],
    parametros: {},
    mostrarCategorias: async (p) => {
        const response = await mostrarCategorias(p);
        set({ parametros: p})
        set({ datacategorias: response })
        set({ categoriaItemSelect: response[0] })
        return response;
    },
    selectCategoria: (p) => {
        set({ categoriaItemSelect: p })
    },
    insertarCategorias: async (p, file) => {
        await InsertarCategorias(p, file);
        const {MostrarCategorias} = get();
        const {parametros} = get();
        set(mostrarCategorias(parametros));
    },
    eliminar
}));