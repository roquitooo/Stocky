import styled from "styled-components";
import { SelectList } from "../../ui/lists/SelectList";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useModulosStore } from "../../../store/ModulosStore";
import { Check } from "../../ui/toggles/Check";
import { useRolesStore } from "../../../store/RolesStore";
import { usePermisosStore } from "../../../store/PermisosStore";
import { useEffect } from "react";
import { useAsignacionCajaSucursalStore } from "../../../store/AsignacionCajaSucursalStore";
import { BarLoader } from "react-spinners";
export const PermisosUser = ({ accionProp, idUsuarioProp }) => {
  const {
    mostrarPermisos,
    toggleModule,
    selectedModules,
    setSelectedModules,
    mostrarPermisosDefault,
    actualizarPermisos,
  } = usePermisosStore();
  const { accion, selectItem: selectItemAsignaciones } =
    useAsignacionCajaSucursalStore();
  const { mostrarModulos } = useModulosStore();
  const { mostrarRoles, rolesItemSelect, setRolesItemSelect } = useRolesStore();
  const accionActual = accionProp ?? accion;
  const idUsuarioActual = idUsuarioProp ?? selectItemAsignaciones?.id_usuario;

  const { data: datamodulos, isLoading: isLoadingModulos } = useQuery({
    queryKey: ["mostrar modulos"],
    queryFn: mostrarModulos,
  });
  const { data: dataRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ["mostrar roles"],
    queryFn: mostrarRoles,
  });
  const { data: dataPermisosDefault, isLoading: isLoadingPermisosDefault } =
    useQuery({
      queryKey: ["mostrar permisos default"],
      queryFn: mostrarPermisosDefault,
    });
  const { data: datapermisos, isLoading: isLoadingPermisosUser } = useQuery({
    queryKey: ["mostrar permisos por usuario"],
    queryFn: () => mostrarPermisos({ id_usuario: idUsuarioActual }),
    enabled: !!idUsuarioActual,
  });
  const mutation = useMutation({
    mutationKey: ["actualizar permisos"],
    mutationFn: () => actualizarPermisos(),
  });
  useEffect(() => {
    if (accionActual === "Nuevo") {
      const permisosPorRol =
        dataPermisosDefault
          ?.filter((permiso) => permiso.id_rol === rolesItemSelect?.id)
          .map((permiso) => permiso.id_modulo) || [];
      setSelectedModules(permisosPorRol);
    }
  }, [accionActual, rolesItemSelect, setSelectedModules, dataPermisosDefault]);

  useEffect(() => {
    if (accionActual !== "Editar") return;
    const modulosUsuario = (datapermisos || []).map((permiso) => permiso.idmodulo);
    setSelectedModules(modulosUsuario);
  }, [accionActual, datapermisos, setSelectedModules]);

  const isLoading =
    isLoadingModulos ||
    isLoadingRoles ||
    isLoadingPermisosDefault ||
    isLoadingPermisosUser;
  if (isLoading) return <BarLoader />;
  return (
    <Container>
      <Title>permisos</Title>
      <label>Tipo: </label>
      <SelectList
        data={dataRoles}
        displayField="nombre"
        onSelect={setRolesItemSelect}
        itemSelect={rolesItemSelect}
      />
      <List>
        {datamodulos?.map((module) => (
          <ListItem key={module.id}>
            <Check
             
              checked={selectedModules.includes(module?.id)}
              onChange={() => toggleModule(module.id)}
            />
            <Label>{module.nombre} </Label>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1.5rem;
  border-left: 1px dashed ${({ theme }) => theme.text};
`;
const Title = styled.span`
  font-size: 1.5rem;
  text-align: center;
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
`;
const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
`;
const Label = styled.span`
  font-size: 1rem;
  color: #555;
  margin-left: 15px;
`;
