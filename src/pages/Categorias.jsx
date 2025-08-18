import { CategoriasTemplate, mostrarCategorias, useCategoriasStore, useEmpresaStore } from "../index";

export function Categorias() {
    const {mostrarCategorias} = useCategoriasStore()
    const {} = useEmpresaStore()
    const {} = useQuery({queryKey: ["mostrar categorias"]});
    return (<CategoriasTemplate/>);
}
