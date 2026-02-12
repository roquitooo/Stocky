import { useEffect } from "react";
import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  ConvertirCapitalize,
  useClientesProveedoresStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation } from "@tanstack/react-query";

export function RegistrarClientesProveedores({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
}) {
  const { insertarCliPro, editarCliPro, tipo } = useClientesProveedoresStore();
  const { dataempresa } = useEmpresaStore();

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();
  
  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar clientes proveedores mutation",
    onError: (err) => console.log("El error", err.message),
    onSuccess: () => cerrarFormulario(),
  });

  const handlesub = (data) => {
    doInsertar(data);
  };

  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };

  async function insertar(data) {
    // 🛡️ PROTECCIÓN CONTRA UNDEFINED
    if (!dataempresa?.id) {
      console.error("Error: No hay ID de empresa cargado.");
      return; 
    }

    if (accion === "Editar") {
      const p = {
        _id: dataSelect.id,
        _nombres: ConvertirCapitalize(data.nombres),
        _id_empresa: dataempresa.id,
        _direccion: data.direccion,
        _telefono: data.telefono,
        _email: data.email,
        _identificador_nacional: data.identificador_nacional,
        _identificador_fiscal: data.identificador_fiscal,
        _tipo: tipo,
      };
      await editarCliPro(p);
    } else {
      const p = {
        _nombres: ConvertirCapitalize(data.nombres),
        _id_empresa: dataempresa.id,
        _direccion: data.direccion,
        _telefono: data.telefono,
        _email: data.email,
        _identificador_nacional: data.identificador_nacional,
        _identificador_fiscal: data.identificador_fiscal,
        _tipo: tipo,
      };

      await insertarCliPro(p);
    }
  }

  useEffect(() => {
    if (accion === "Editar") {
      // Lógica de edición si fuera necesaria
    }
  }, []);

  return (
    <Container>
      {isPending ? (
        <span>...🔼</span>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar"
                  ? "Editar " + tipo
                  : "Registrar nuevo " + tipo}
              </h1>
            </section>

            <section>
              <span onClick={onClose}>x</span>
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="form-subcontainer">
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.nombres}
                    type="text"
                    placeholder="nombres"
                    {...register("nombres", {
                      required: true,
                    })}
                  />
                  <label className="form__label">nombres</label>
                  {errors.nombres?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.direccion}
                    type="text"
                    placeholder="direccion"
                    {...register("direccion", {
                      required: true,
                    })}
                  />
                  <label className="form__label">direccion</label>
                  {errors.direccion?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.telefono}
                    type="text"
                    placeholder="telefono"
                    {...register("telefono", {
                      required: true,
                    })}
                  />
                  <label className="form__label">telefono</label>
                  {errors.telefono?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.email}
                    type="text"
                    placeholder="email"
                    {...register("email", {
                      required: true,
                    })}
                  />
                  <label className="form__label">email</label>
                  {errors.email?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.identificador_nacional}
                    type="text"
                    placeholder="identificador_nacional"
                    {...register("identificador_nacional", {
                      required: true,
                    })}
                  />
                  <label className="form__label">identificador nacional</label>
                  {errors.identificador_nacional?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect.identificador_fiscal}
                    type="text"
                    placeholder="identificador_fiscal"
                    {...register("identificador_fiscal", {
                      required: true,
                    })}
                  />
                  <label className="form__label">identificador fiscal</label>
                  {errors.identificador_fiscal?.type === "required" && (
                    <p>Campo requerido</p>
                  )}
                </InputText>
              </article>
              <Btn1
                icono={<v.iconoguardar />}
                titulo="Guardar"
                bgcolor="#F9D70B"
              />
            </section>
          </form>
        </div>
      )}
    </Container>
  );
}
// ... Estilos (Container, ContentTitle, PictureContainer) se mantienen igual ...
const Container = styled.div`
  transition: 0.5s;
  top: 0;
  left: 0;
  position: fixed;
  background-color: rgba(10, 9, 9, 0.5);
  display: flex;
  width: 100%;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  .sub-contenedor {
    position: relative;
    width: min(92vw, 500px);
    max-width: 92vw;
    border-radius: 20px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4);
    padding: clamp(12px, 3vw, 20px);
    z-index: 100;
    .headers {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      h1 { font-size: clamp(18px, 4vw, 20px); font-weight: 500; }
      span { font-size: 20px; cursor: pointer; }
    }
    .formulario {
      .form-subcontainer {
        gap: 20px; display: flex; flex-direction: column;
        .colorContainer { .colorPickerContent { padding-top: 15px; min-height: 50px; } }
      }
    }
  }
`;
