import PropTypes from "prop-types";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  ConvertirCapitalize,
  useClientesProveedoresStore,
} from "../../../index";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import {
  formatearIdentificadorFiscalVisual,
  formatearIdentificadorNacionalVisual,
  formatearTelefonoVisual,
  normalizarIdentificadorNumerico,
  normalizarTelefono,
  normalizarTextoPlano,
  validarIdentificadorFiscal,
  validarIdentificadorNacional,
  validarTelefono,
} from "../../../utils/validacionesFormulario";

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

  const crearMascaraVisual = (formateador, onChangeOriginal) => (event) => {
    event.target.value = formateador(event.target.value);
    onChangeOriginal(event);
  };

  const registroNombres = register("nombres", {
    required: "Campo requerido",
    setValueAs: (value) => normalizarTextoPlano(value),
  });
  const registroDireccion = register("direccion", {
    required: "Campo requerido",
    setValueAs: (value) => normalizarTextoPlano(value),
  });
  const registroTelefono = register("telefono", {
    required: "Campo requerido",
    setValueAs: (value) => normalizarTelefono(value),
    validate: validarTelefono,
  });
  const registroEmail = register("email", {
    required: "Campo requerido",
    setValueAs: (value) => normalizarTextoPlano(value),
  });
  const registroIdentificadorNacional = register("identificador_nacional", {
    required: "Campo requerido",
    setValueAs: (value) => normalizarIdentificadorNumerico(value),
    validate: validarIdentificadorNacional,
  });
  const registroIdentificadorFiscal = register("identificador_fiscal", {
    required: "Campo requerido",
    setValueAs: (value) => normalizarIdentificadorNumerico(value),
    validate: validarIdentificadorFiscal,
  });

  const handleTelefonoChange = crearMascaraVisual(
    formatearTelefonoVisual,
    registroTelefono.onChange
  );
  const handleIdentificadorNacionalChange = crearMascaraVisual(
    formatearIdentificadorNacionalVisual,
    registroIdentificadorNacional.onChange
  );
  const handleIdentificadorFiscalChange = crearMascaraVisual(
    formatearIdentificadorFiscalVisual,
    registroIdentificadorFiscal.onChange
  );

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
    if (!dataempresa?.id) {
      console.error("Error: No hay ID de empresa cargado.");
      return;
    }

    if (accion === "Editar") {
      const p = {
        _id: dataSelect?.id,
        _nombres: ConvertirCapitalize(data.nombres),
        _id_empresa: dataempresa.id,
        _direccion: normalizarTextoPlano(data.direccion),
        _telefono: normalizarTelefono(data.telefono),
        _email: normalizarTextoPlano(data.email),
        _identificador_nacional: normalizarIdentificadorNumerico(
          data.identificador_nacional
        ),
        _identificador_fiscal: normalizarIdentificadorNumerico(
          data.identificador_fiscal
        ),
        _tipo: tipo,
      };
      await editarCliPro(p);
      return;
    }

    const p = {
      _nombres: ConvertirCapitalize(data.nombres),
      _id_empresa: dataempresa.id,
      _direccion: normalizarTextoPlano(data.direccion),
      _telefono: normalizarTelefono(data.telefono),
      _email: normalizarTextoPlano(data.email),
      _identificador_nacional: normalizarIdentificadorNumerico(
        data.identificador_nacional
      ),
      _identificador_fiscal: normalizarIdentificadorNumerico(
        data.identificador_fiscal
      ),
      _tipo: tipo,
    };

    await insertarCliPro(p);
  }

  return (
    <Container>
      {isPending ? (
        <span>...cargando</span>
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
                    defaultValue={dataSelect?.nombres || ""}
                    type="text"
                    placeholder="Nombres"
                    {...registroNombres}
                  />
                  <label className="form__label">Nombres</label>
                  {errors.nombres && <p>{errors.nombres.message}</p>}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect?.direccion || ""}
                    type="text"
                    placeholder="Dirección"
                    {...registroDireccion}
                  />
                  <label className="form__label">Dirección</label>
                  {errors.direccion && <p>{errors.direccion.message}</p>}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={formatearTelefonoVisual(dataSelect?.telefono || "")}
                    type="text"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="Teléfono"
                    {...registroTelefono}
                    onChange={handleTelefonoChange}
                  />
                  <label className="form__label">Teléfono</label>
                  {errors.telefono && <p>{errors.telefono.message}</p>}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={dataSelect?.email || ""}
                    type="email"
                    autoComplete="email"
                    placeholder="Email"
                    {...registroEmail}
                  />
                  <label className="form__label">Email</label>
                  {errors.email && <p>{errors.email.message}</p>}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={formatearIdentificadorNacionalVisual(
                      dataSelect?.identificador_nacional || ""
                    )}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Identificador nacional"
                    {...registroIdentificadorNacional}
                    onChange={handleIdentificadorNacionalChange}
                  />
                  <label className="form__label">Identificador nacional</label>
                  {errors.identificador_nacional && (
                    <p>{errors.identificador_nacional.message}</p>
                  )}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    defaultValue={formatearIdentificadorFiscalVisual(
                      dataSelect?.identificador_fiscal || ""
                    )}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Identificador fiscal"
                    {...registroIdentificadorFiscal}
                    onChange={handleIdentificadorFiscalChange}
                  />
                  <label className="form__label">Identificador fiscal</label>
                  {errors.identificador_fiscal && (
                    <p>{errors.identificador_fiscal.message}</p>
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

RegistrarClientesProveedores.propTypes = {
  onClose: PropTypes.func.isRequired,
  dataSelect: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    nombres: PropTypes.string,
    direccion: PropTypes.string,
    telefono: PropTypes.string,
    email: PropTypes.string,
    identificador_nacional: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    identificador_fiscal: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  }),
  accion: PropTypes.string,
  setIsExploding: PropTypes.func.isRequired,
};

RegistrarClientesProveedores.defaultProps = {
  dataSelect: {},
  accion: "",
};

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

      h1 {
        font-size: clamp(18px, 4vw, 20px);
        font-weight: 500;
      }

      span {
        font-size: 20px;
        cursor: pointer;
      }
    }

    .formulario {
      .form-subcontainer {
        gap: 20px;
        display: flex;
        flex-direction: column;

        .colorContainer {
          .colorPickerContent {
            padding-top: 15px;
            min-height: 50px;
          }
        }
      }
    }
  }
`;
