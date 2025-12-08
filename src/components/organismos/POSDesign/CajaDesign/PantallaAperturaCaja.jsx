import styled from "styled-components";
import { InputText2 } from "../../formularios/InputText2";
import { Btn1 } from "../../../moleculas/Btn1";
import { useState } from "react";
import { useUsuariosStore } from "../../../../store/UsuariosStore";
import { useCajasStore } from "../../../../store/CajasStore";
import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormattedDate } from "../../../../hooks/useFormattedDate";
import { useMetodosPagoStore } from "../../../../store/MetodosPagoStore";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { toast } from "sonner"; // <--- FALTABA ESTA IMPORTACIÓN



export function PantallaAperturaCaja() {
  const [montoEfectivo, setMontoEfectivo] = useState(0);
  const fechaActual = useFormattedDate();
  const queryClient = useQueryClient();
  const { datausuarios } = useUsuariosStore();
  const { dataCaja } = useCajasStore();
  const { aperturarcaja } = useCierreCajaStore();
  const { dataMetodosPago } = useMetodosPagoStore();
  const { insertarMovCaja } = useMovCajaStore();

  const registrarMovCaja = async (p) => {
    // Buscamos el ID del método efectivo de forma segura
    const metodoEfectivo = dataMetodosPago.find((item) => item.nombre === "Efectivo");
    const id_metodo_pago = metodoEfectivo ? metodoEfectivo.id : 0;

    const pmovcaja = {
      fecha_movimiento: fechaActual,
      tipo_movimiento: "apertura",
      monto: montoEfectivo ? montoEfectivo : 0,
      id_metodo_pago: id_metodo_pago,
      descripcion: `Apertura de caja con`,
      id_usuario: datausuarios?.id,
      id_cierre_caja: p.id_cierre_caja,
    };

    await insertarMovCaja(pmovcaja);
  };

  const insertar = async () => {
    // Validaciones básicas
    if (!dataCaja?.id) {
        toast.error("No se detectó la caja seleccionada");
        return;
    }

    const p = {
      fechainicio: fechaActual,
      fechacierre: null, // <--- IMPORTANTE: Enviamos null para mantenerla abierta
      id_usuario: datausuarios?.id,
      id_caja: dataCaja.id,
    };
    
    // Guardamos la apertura
    const data = await aperturarcaja(p);

    // Si se guardó bien, registramos el movimiento de dinero inicial
    if(data?.id){
        await registrarMovCaja({ id_cierre_caja: data.id });
    }
    
    return data; // Retornamos data para usarla en onSuccess
  };

  const mutation = useMutation({
    mutationKey: ["aperturar caja"],
    mutationFn: insertar,
    onSuccess: (data) => {
      toast.success("Caja aperturada con éxito");
      
      // Actualizamos manualmente el caché para que la UI responda de inmediato
      if(data) {
        queryClient.setQueryData(["mostrar cierre de caja"], data);
      }
      
      // Invalidamos para asegurar consistencia en segundo plano
      queryClient.invalidateQueries(["mostrar cierre de caja"]);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  return (
    <Container>
      <section className="area1">
        <span className="title">Aperturar caja con:</span>

        <InputText2>
          <input
            className="form__field"
            onChange={(e) => setMontoEfectivo(parseFloat(e.target.value))}
            type="number"
            placeholder="0.00"
          />
        </InputText2>
        <span>en efectivo.</span>
        <article className="contentbtn">
          <Btn1
            titulo="OMITIR"
            funcion={() => {
              setMontoEfectivo(0);
              mutation.mutateAsync();
            }}
          />
          <Btn1
            titulo="APERTURAR"
            color="#ffffff"
            border="2px"
            bgcolor="#ffbd59"
            funcion={() => mutation.mutateAsync()}
          />
        </article>
      </section>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.bgtotal};
  align-items: center;
  justify-content: center;
  display: flex;
  .area1 {
    display: flex;
    flex-direction: column;
    gap: 12px;
    .title {
      font-size: 19px;
      font-weight: bold;
    }
    .contentbtn {
      display: flex;
      gap: 12px;
    }
  }
`;