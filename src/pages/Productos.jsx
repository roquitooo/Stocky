import { useQuery } from "@tanstack/react-query";
import {
  ProductosTemplate,
  Spinner1,
  useMarcaStore,
  useEmpresaStore,
} from "../index";

export function Productos() {
  const { mostrarmarca, buscarmarca, buscador } =
    useMarcaStore();
  const { dataempresa } = useEmpresaStore();
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar marca", dataempresa?.id],
    queryFn: () => mostrarmarca({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });
  //buscar marcas
  const {  } = useQuery({
    queryKey: ["buscar marca", buscador],
    queryFn: () =>
      buscarmarca({ id_empresa: dataempresa?.id, nombre: buscador }),
    enabled: !!dataempresa,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return <Spinner1 />;
  }
  if (error) {
    return <span>error...</span>;
  }
  return <ProductosTemplate />;
}
