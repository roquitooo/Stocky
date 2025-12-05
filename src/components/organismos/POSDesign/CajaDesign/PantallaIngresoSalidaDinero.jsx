import styled from "styled-components";
import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { VolverBtn } from "../../../moleculas/VolverBtn";
import { InputText2 } from "../../formularios/InputText2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from "react";
import { Btn1 } from "../../../moleculas/Btn1";
import { useCajasStore } from "../../../../store/CajasStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { useMetodosPagoStore } from "../../../../store/MetodosPagoStore";
import { useUsuariosStore } from "../../../../store/UsuariosStore";
import { useFormattedDate } from "../../../../hooks/useFormattedDate";

export function PantallaIngresoSalidaDinero() {
  const fechaActual = useFormattedDate();
  const { tipoRegistro, setStateIngresoSalida } = useCierreCajaStore();
  const { insertarMovCaja } = useMovCajaStore();
  const [selectedMetodo, setSelectedMetodo] = useState(null);
  
  const { dataMetodosPago } = useMetodosPagoStore();
  const { datausuarios } = useUsuariosStore();
  const { dataCierreCaja } = useCierreCajaStore();
  
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();

  const insertar = async (data) => {
    const pmovcaja = {
      fecha_movimiento: fechaActual,
      tipo_movimiento: tipoRegistro,
      monto: parseFloat(data.monto),
      id_metodo_pago: selectedMetodo?.id,
      descripcion: `${tipoRegistro === "ingreso" ? "Ingreso" : "Salida"} de dinero con ${selectedMetodo?.nombre} ${data.motivo ? `- detalle: ${data.motivo}` : ""}`,
      id_usuario: datausuarios?.id,
      id_cierre_caja: dataCierreCaja?.id,
    };

    await insertarMovCaja(pmovcaja);
  };

  const { mutate: doInsertar } = useMutation({
    mutationKey: ["insertar ingresos salidas caja"],
    mutationFn: insertar,
    onSuccess: () => {
      toast.success("Ingreso/retiro registrado!");
      setStateIngresoSalida(false);
      reset();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || "Error al registrar !!!";
      toast.error(`Error: ${errorMessage}`);
    },
  });

  const manejadorEnvio = (data) => {
    if (!selectedMetodo) {
      toast.warning("Selecciona un método de pago");
      return;
    }
    doInsertar(data);
  };

  const handleMetodoClick = (item) => {
    setSelectedMetodo(item);
  };

  useEffect(() => {
    const efectivo = dataMetodosPago?.find(
      (item) => item.nombre === "Efectivo"
    );
    if (efectivo) {
      setSelectedMetodo(efectivo);
    }
  }, [dataMetodosPago]);

  return (
    <Container>
      <VolverBtn funcion={() => setStateIngresoSalida(false)} />

      <span className="title">
        {tipoRegistro === "ingreso"
          ? "INGRESAR DINERO A CAJA"
          : "RETIRAR DINERO DE CAJA"}
      </span>
      
      <section className="areatipopago">
        {/* CORRECCIÓN AQUÍ: FILTRO ESTRICTO */}
        {dataMetodosPago
          ?.filter((item) => item.nombre === "Efectivo" || item.nombre === "Tarjeta")
          .map((item, index) => {
            return (
              <article className="box" key={index}>
                <Btn1
                  imagen={item.icono != "-" ? item.icono : null}
                  titulo={item.nombre}
                  border="0"
                  height="70px"
                  width="100%"
                  funcion={() => handleMetodoClick(item)}
                  bgcolor={item.id === selectedMetodo?.id ? "#ffbd59" : "#FFF"} // Color activo amarillo
                  color={item.id === selectedMetodo?.id ? "#FFF" : "#000"} 
                />
              </article>
            );
          })}
      </section>

      <form onSubmit={handleSubmit(manejadorEnvio)}>
        <section className="area1">
          <span>Monto:</span>
          <InputText2>
            <input
              className="form__field"
              placeholder="0.00"
              type="number"
              step="0.01"
              {...register("monto", { required: true })}
            />
            {errors.monto?.type === "required" && <p>Campo requerido</p>}
          </InputText2>

          <span>Motivo</span>
          <InputText2>
            <textarea
              className="form__field"
              rows="3"
              placeholder="Descripcion del motivo..."
              {...register("motivo")}
            />
          </InputText2>
          
          <article className="contentbtn">
            <Btn1
              titulo={"REGISTRAR"}
              color="#ffffff"
              border="2px"
              bgcolor="#ffbd59"
            />
          </article>
        </section>
      </form>
    </Container>
  );
}

// --- ESTILOS ---
const Container = styled.div`
  height: 100vh;
  position: absolute;
  background-color: ${({ theme }) => theme.bgtotal};
  width: 100%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  
  .areatipopago {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 20px;
    justify-content: center;

    .box {
      width: 150px; 
      display: flex;
      gap: 10px;
    }
  }
  .title {
    font-size: 25px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
  }
  .area1 {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 300px; /* Ancho fijo para el formulario */
    
    .contentbtn {
      margin-top: 15px;
      display: flex;
      gap: 12px;
    }
  }
`;