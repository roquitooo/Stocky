import styled from "styled-components";
import PropTypes from "prop-types";
import { SelectList } from "../../ui/lists/SelectList";
import { useQuery } from "@tanstack/react-query";
import { useModulosStore } from "../../../store/ModulosStore";
import { Check } from "../../ui/toggles/Check";
import { useRolesStore } from "../../../store/RolesStore";
import { usePermisosStore } from "../../../store/PermisosStore";
import { useEffect, useRef } from "react";
import { useAsignacionCajaSucursalStore } from "../../../store/AsignacionCajaSucursalStore";
import { BarLoader } from "react-spinners";
export const PermisosUser = ({ accionProp, idUsuarioProp }) => {
  const {
    mostrarPermisos,
    toggleModule,
    selectedModules,
    setSelectedModules,
    mostrarPermisosDefault,
  } = usePermisosStore();
  const { accion, selectItem: selectItemAsignaciones } =
    useAsignacionCajaSucursalStore();
  const { mostrarModulos } = useModulosStore();
  const { mostrarRoles, rolesItemSelect, setRolesItemSelect } = useRolesStore();
  const permisosOriginalesRef = useRef([]);
  const prevIsAdminRef = useRef(false);
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
  useEffect(() => {
    if (!rolesItemSelect) return;

    const rolNombre = String(rolesItemSelect?.nombre || "").toLowerCase();
    const isAdmin = rolNombre.includes("admin");

    // Regla de negocio: rol Admin => acceso completo
    if (isAdmin) {
      const todosLosModulos = (datamodulos || []).map((m) => m.id);
      setSelectedModules(todosLosModulos);
      prevIsAdminRef.current = true;
      return;
    }

    // Para usuario nuevo, usamos permisos por defecto del rol seleccionado.
    if (accionActual === "Nuevo") {
      const permisosPorRol =
        dataPermisosDefault
          ?.filter((permiso) => permiso.id_rol === rolesItemSelect?.id)
          .map((permiso) => permiso.id_modulo) || [];
      setSelectedModules(permisosPorRol);
      prevIsAdminRef.current = false;
      return;
    }

    // En edición: si venimos de Admin y volvemos a un rol no-admin,
    // restauramos los permisos originales del usuario.
    if (accionActual === "Editar" && prevIsAdminRef.current) {
      setSelectedModules(permisosOriginalesRef.current || []);
      prevIsAdminRef.current = false;
    }
  }, [
    accionActual,
    rolesItemSelect,
    setSelectedModules,
    dataPermisosDefault,
    datamodulos,
  ]);

  useEffect(() => {
    if (accionActual !== "Editar") return;
    const modulosUsuario = (datapermisos || []).map((permiso) => permiso.idmodulo);
    permisosOriginalesRef.current = modulosUsuario;
    prevIsAdminRef.current = false;
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
PermisosUser.propTypes = {
  accionProp: PropTypes.string,
  idUsuarioProp: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

PermisosUser.defaultProps = {
  accionProp: undefined,
  idUsuarioProp: undefined,
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 1.25rem;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%),
    ${({ theme }) => theme.bg2};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);

  label {
    color: ${({ theme }) => theme.colorSubtitle};
    margin-bottom: 8px;
  }
`;
const Title = styled.span`
  font-size: 1.5rem;
  text-align: center;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin-bottom: 0.35rem;
  text-transform: capitalize;
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
`;
const ListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.65rem 0;
  border-bottom: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.07);

  &:last-child {
    border-bottom: none;
  }
`;
const Label = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colorSubtitle};
  margin-left: 6px;
`;
