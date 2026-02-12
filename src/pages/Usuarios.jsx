import { useQuery } from "@tanstack/react-query";
import { UsuariosTemplate } from "../components/templates/UsuariosTemplate";
import { useEmpresaStore } from "../store/EmpresaStore";
import { useAsignacionCajaSucursalStore } from "../store/AsignacionCajaSucursalStore";

export const Usuarios = () => {
  const { dataempresa } = useEmpresaStore();
  const { mostrarUsuariosAsignados, buscarUsuariosAsignados, buscador } = useAsignacionCajaSucursalStore();
  
  // CONSULTA 1: MOSTRAR TODOS
  const { isLoading, error } = useQuery({
    queryKey: ["mostrar usuarios asignados", { id_empresa: dataempresa?.id }],
    queryFn: () => mostrarUsuariosAsignados({ id_empresa: dataempresa?.id, buscador: "" }),
    enabled: !!dataempresa?.id && !buscador, 
  });

  // CONSULTA 2: BUSCAR
  const { isLoading: isloadingbuscarusuarios, error: errorBuscarUser } = useQuery({
    queryKey: ["buscar usuarios asignados", { id_empresa: dataempresa?.id, buscador: buscador }],
    queryFn: () => buscarUsuariosAsignados({ id_empresa: dataempresa?.id, buscador: buscador }),
    enabled: !!dataempresa?.id && !!buscador, 
  });

  // ❌ ELIMINADO: Ya no retornamos el BarLoader aquí para no destruir la vista
  // if (isLoading || isloadingbuscarusuarios) return <BarLoader color="#6d6d6d" />;
  
  if (error) return <span>error...{error.message}</span>;
  if (errorBuscarUser) return <span>error buscando...{errorBuscarUser.message}</span>;

  return (
    <UsuariosTemplate 
      // ✅ Pasamos el estado de carga como prop al template
      isLoading={isLoading || isloadingbuscarusuarios} 
    />
  );
};