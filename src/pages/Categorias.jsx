import { useQuery } from "@tanstack/react-query";
import {
  CategoriasTemplate,
  Spinner1,
  useCategoriasStore,
  useEmpresaStore,
} from "../index";

export function Categorias() {
  const { mostrarCategorias, buscarCategorias, buscador } =
    useCategoriasStore();
  const { dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    // chunk-SO42POYP.js?v=9e4f1a13:721 As of v4, queryKey needs to be an Array. If you are using a string like 'repoData', please change it to an Array, e.g. ['repoData']
    queryKey: ["mostrar categorias", dataempresa?.id],
    queryFn: () => mostrarCategorias({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
  //buscar categorias
  console.log(dataempresa.id)
  const {  } = useQuery({
    queryKey: ["buscar categorias", buscador],
    queryFn: () =>
      buscarCategorias({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Spinner1 />;
  }
  if (error) {
    return <span>error...</span>;
  }
  return <CategoriasTemplate />;
}
