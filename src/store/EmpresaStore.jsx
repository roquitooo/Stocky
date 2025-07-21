import { create } from "zustand";
import {InsertarEmpresa} from "../index";

export const useEmpresaStore = create((set) => ({
    insertarempresa: async (p) => {
        const response = await InsertarEmpresa(p)
        console.log("respuesta empresa", response);
    }

}));