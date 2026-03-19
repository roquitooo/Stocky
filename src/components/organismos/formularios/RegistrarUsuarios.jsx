import styled from "styled-components";
import { useForm } from "react-hook-form";
import { BtnClose } from "../../ui/buttons/BtnClose";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { SelectList } from "../../ui/lists/SelectList";
import { BarLoader } from "react-spinners";
import { PermisosUser } from "../UsuariosDesign/PermisosUser";
import { useEffect, useState } from "react";

import { InputText } from "./InputText";
import { Btn1 } from "../../moleculas/Btn1";
import { useSucursalesStore } from "../../../store/SucursalesStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useCajasStore } from "../../../store/CajasStore";
import { useRolesStore } from "../../../store/RolesStore";
import { usePermisosStore } from "../../../store/PermisosStore";

export function RegistrarUsuarios({ accion, dataSelect, onClose }) {
  const [showPass, setShowPass] = useState(false);
  const queryClient = useQueryClient();
  const { mostrarCajaXSucursal } = useCajasStore();
  const { insertarUsuario, editarUsuario } = useUsuariosStore();
  const { dataempresa } = useEmpresaStore();
  const { mostrarRoles, rolesItemSelect, selectRol } = useRolesStore();
  const { mostrarSucursales } = useSucursalesStore();
  const { selectedModules } = usePermisosStore();

  const { data: dataSucursales, isLoading: isloadingSucursales } = useQuery({
    queryKey: ["mostrar sucursales", { id_empresa: dataempresa?.id }],
    queryFn: () => mostrarSucursales({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });

  const sucursalGenericaId = dataSucursales?.[0]?.id;

  const { data: dataCaja, isLoading: isloadingCajas } = useQuery({
    queryKey: ["mostrar caja por sucursal", { id_sucursal: sucursalGenericaId }],
    queryFn: () => mostrarCajaXSucursal({ id_sucursal: sucursalGenericaId }),
    enabled: !!sucursalGenericaId,
  });

  const { data: dataRoles, isLoading: isloadingRoles } = useQuery({
    queryKey: ["mostrar roles", { id_empresa: dataempresa?.id }],
    queryFn: () => mostrarRoles({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  useEffect(() => {
    if (accion !== "Editar" || !dataRoles?.length) return;
    const rolActual = dataRoles.find(
      (item) =>
        item?.id === dataSelect?.id_rol ||
        item?.nombre === dataSelect?.rol ||
        String(item?.id) === String(dataSelect?.id_rol)
    );
    if (rolActual) selectRol(rolActual);
  }, [accion, dataRoles, dataSelect, selectRol]);

  const insertar = async (data) => {
    let cajaGenericaId = null;
    if (Array.isArray(dataCaja) && dataCaja.length > 0) {
      cajaGenericaId = dataCaja[0].id;
    } else if (dataCaja?.id) {
      cajaGenericaId = dataCaja.id;
    }

    if (!rolesItemSelect?.id) {
      toast.warning("Debes seleccionar un ROL");
      return;
    }

    const p = {
      id: accion === "Editar" ? dataSelect?.id : null,
      nombres: data.nombres,
      nro_doc: data.nro_doc,
      telefono: data.telefono,
      id_empresa: dataempresa?.id,
      id_rol: rolesItemSelect?.id,
      correo: data.email,
      id_sucursal: sucursalGenericaId,
      id_caja: cajaGenericaId,
      email: data.email,
      pass: data.pass,
    };

    try {
      if (accion === "Editar") {
        await editarUsuario({
          id: dataSelect?.id_usuario ?? dataSelect?.id,
          nombres: data.nombres || dataSelect?.nombres || dataSelect?.usuario,
          nro_doc: data.nro_doc || dataSelect?.nro_doc || "-",
          telefono: data.telefono || dataSelect?.telefono || "-",
          id_rol: rolesItemSelect?.id ?? dataSelect?.id_rol ?? null,
          correo: data.email || dataSelect?.correo || dataSelect?.email,
          modulos: selectedModules,
        });
      } else {
        await insertarUsuario(p);
      }
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      throw error;
    }
  };

  const { isPending, mutate: doInsertar } = useMutation({
    mutationKey: ["insertar usuarios"],
    mutationFn: insertar,
    onError: (error) => {
      const msg = String(error?.message || "");
      if (msg.includes("not_allowed")) {
        toast.error("Permiso denegado para consultar Auth. Usa otro correo o ajusta permisos del RPC.");
        return;
      }
      if (msg.includes("users_email_partial_key") || msg.includes("duplicate key value")) {
        toast.error("Ese correo ya existe en Auth. Usa otro o reasigna el usuario existente.");
        return;
      }
      if (msg.includes("otra empresa")) {
        toast.error(msg);
        return;
      }
      toast.error(`Error: ${msg}`);
    },
    onSuccess: () => {
      toast.success(
        accion === "Editar"
          ? "Usuario actualizado correctamente"
          : "Usuario registrado correctamente"
      );
      queryClient.invalidateQueries(["mostrar usuarios asignados"]);
      queryClient.invalidateQueries(["buscar usuarios asignados"]);
      onClose();
    },
  });

  const isLoading = isloadingSucursales || isloadingCajas || isloadingRoles;
  if (isLoading) return <BarLoader color="#6d6d6d" />;

  return (
    <Container>
      {isPending ? (
        <span className="loading-text">Guardando usuario...</span>
      ) : (
        <Form onSubmit={handleSubmit(doInsertar)}>
          <Header>
            <Title>{accion === "Editar" ? "Editar usuario" : "Registrar usuario"}</Title>
            <BtnClose funcion={onClose} />
          </Header>
          <section className="main">
            <section className="area1">
              <article>
                <InputText icono={<Icon icon="material-symbols:mail" />}>
                  <input
                    id="email"
                    className="form__field"
                    type="email"
                    autoComplete="email"
                    defaultValue={dataSelect?.email || dataSelect?.correo || ""}
                    {...register("email", { required: true })}
                  />
                  <label htmlFor="email" className="form__label">Email</label>
                </InputText>
              </article>
              <article className="pass-row">
                <InputText icono={<Icon icon="mdi:password" />}>
                  <input
                    id="pass"
                    className="form__field pass-field"
                    type={showPass ? "text" : "password"}
                    autoComplete={accion === "Editar" ? "new-password" : "current-password"}
                    {...register("pass", { required: accion !== "Editar" })}
                  />
                  <label htmlFor="pass" className="form__label">Contraseña</label>
                  <button
                    type="button"
                    className="pass-toggle-inline"
                    onClick={() => setShowPass((prev) => !prev)}
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </InputText>
              </article>

              <article>
                <InputText icono={<Icon icon="mdi:user" />}>
                  <input
                    id="nombres"
                    className="form__field"
                    type="text"
                    autoComplete="name"
                    defaultValue={dataSelect?.usuario || dataSelect?.nombres || ""}
                    {...register("nombres", { required: true })}
                  />
                  <label htmlFor="nombres" className="form__label">Nombres</label>
                </InputText>
              </article>
              <article>
                <InputText icono={<Icon icon="mdi:card-account-details" />}>
                  <input
                    id="nro_doc"
                    className="form__field"
                    type="number"
                    autoComplete="off"
                    defaultValue={dataSelect?.nro_doc || ""}
                    {...register("nro_doc", { required: true })}
                  />
                  <label htmlFor="nro_doc" className="form__label">Nro. Documento</label>
                </InputText>
              </article>
              <article>
                <InputText icono={<Icon icon="mdi:phone" />}>
                  <input
                    id="telefono"
                    className="form__field"
                    type="text"
                    autoComplete="tel"
                    defaultValue={dataSelect?.telefono || ""}
                    {...register("telefono", { required: true })}
                  />
                  <label htmlFor="telefono" className="form__label">Teléfono</label>
                </InputText>
              </article>

              <article className="contentasignacion">
                <span>Rol:</span>
                <SelectList
                  onSelect={selectRol}
                  itemSelect={rolesItemSelect}
                  displayField="nombre"
                  data={dataRoles}
                />
              </article>

              <Btn1 titulo={"Guardar"} bgcolor={"#ffbd58"} color={"#fff"} />
            </section>

            <section className="area2">
              <span className="modules-title">
                Permisos (Módulos):
              </span>
              <PermisosUser
                accionProp={accion}
                idUsuarioProp={dataSelect?.id_usuario ?? dataSelect?.id}
              />
            </section>
          </section>
        </Form>
      )}
    </Container>
  );
}

const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 18px;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(7px);

  .loading-text {
    font-size: 20px;
    font-weight: bold;
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    padding: 20px;
    border-radius: 14px;
    border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.1);
  }
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  background:
    radial-gradient(circle at top right, rgba(255, 189, 88, 0.14) 0, transparent 28%),
    linear-gradient(180deg, rgba(${({ theme }) => theme.bodyRgba}, 0.96) 0%, ${({ theme }) => theme.bg2} 100%);
  padding: 24px;
  border-radius: 20px;
  position: relative;
  overflow-y: auto;
  max-height: 90vh;
  width: min(1180px, 96vw);
  margin: 0;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.12);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.42);

  /* Ajuste del campo de contraseÃ±a */
  .pass-row {
    position: relative; /* Asegura que el contenido se contenga aquÃ­ */
  }

  .pass-field {
    padding-right: 40px; /* Espacio suficiente para que el texto no toque el ojo */
  }

  .pass-toggle-inline {
    position: absolute;
    right: 10px;      /* Un poco de margen derecho */
    top: 50%;         /* Centrado vertical perfecto */
    transform: translateY(-50%); /* CorrecciÃ³n exacta del centro */
    border: none;
    background: transparent;
    color: #ffbd59;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    width: 30px;
    height: 30px;
    padding: 0;
    z-index: 2;
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow-y: auto;
    @media (min-width: 768px) {
      flex-direction: row;
    }
    .area1 {
      display: flex;
      flex-direction: column;
      gap: 14px;
      flex: 1;
      padding: 18px;
      border-radius: 18px;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.025) 0%, rgba(255, 255, 255, 0.01) 100%),
        ${({ theme }) => theme.body};
      border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.08);
      > article {
        width: 100%;
        max-width: 280px;
      }
      > article .form__group {
        width: 100%;
      }
    }
    .area2 {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .modules-title {
      font-size: 14px;
      font-weight: 700;
      color: ${({ theme }) => theme.colorSubtitle};
      letter-spacing: 0.01em;
    }
  }

  .contentasignacion {
    display: flex;
    flex-direction: column;
    gap: 8px;
    span {
      font-size: 14px;
      font-weight: 600;
      color: ${({ theme }) => theme.colorSubtitle};
    }
  }
`;
const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  padding-right: 48px;
`;
const Title = styled.span`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text};
  letter-spacing: -0.02em;
`;


