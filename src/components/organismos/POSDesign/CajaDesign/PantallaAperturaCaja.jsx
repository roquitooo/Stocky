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
import { toast } from "sonner";

export function PantallaAperturaCaja() {
  const [montoEfectivo, setMontoEfectivo] = useState("");
  const fechaActual = useFormattedDate();
  const queryClient = useQueryClient();

  const { datausuarios } = useUsuariosStore();
  const { dataCaja, cajaSelectItem } = useCajasStore();

  // ✅ NOMBRES CORRECTOS (como están en tu store)
  const aperturarCaja = useCierreCajaStore((s) => s.aperturarCaja);
  const mostrarCierreCaja = useCierreCajaStore((s) => s.mostrarCierreCaja);

  const { dataMetodosPago } = useMetodosPagoStore();
  const { insertarMovCaja } = useMovCajaStore();

  const cajaActiva =
    cajaSelectItem ?? (Array.isArray(dataCaja) ? dataCaja[0] : dataCaja);

  const id_caja = cajaActiva?.id;

  const registrarMovCaja = async ({ id_cierre_caja, monto }) => {
    const metodoEfectivo = (dataMetodosPago ?? []).find((m) => m.nombre === "Efectivo");
    const id_metodo_pago = metodoEfectivo?.id ?? 0;

    await insertarMovCaja({
      fecha_movimiento: fechaActual,
      tipo_movimiento: "apertura",
      monto: Number.isFinite(monto) ? monto : 0,
      id_metodo_pago,
      descripcion: "Apertura de caja",
      id_usuario: datausuarios?.id,
      id_cierre_caja,
    });
  };

  const insertar = async ({ monto }) => {
    if (typeof aperturarCaja !== "function") {
      throw new Error("aperturarCaja no está disponible en el store.");
    }

    if (!id_caja) {
      throw new Error("No se detectó la caja seleccionada");
    }

    // 1) Abrimos caja (tu store devuelve true/false)
    const ok = await aperturarCaja({
      id_caja,
      id_usuario: datausuarios?.id,
      total_efectivo_calculado: monto, // ✅ tu store usa este campo
      fechainicio: fechaActual,
      fechacierre: null,
    });

    if (!ok) {
      throw new Error("No se pudo aperturar la caja");
    }

    // 2) Traemos el cierre abierto para obtener el ID
    const cierre = await mostrarCierreCaja({ id_caja });

    if (!cierre?.id) {
      throw new Error("Caja abierta, pero no pude obtener el ID del cierre");
    }

    // 3) Registramos movimiento
    await registrarMovCaja({ id_cierre_caja: cierre.id, monto });

    return cierre;
  };

  const mutation = useMutation({
    mutationKey: ["aperturar caja"],
    mutationFn: insertar,
    onSuccess: (cierre) => {
      toast.success("Caja aperturada con éxito");

      // ✅ misma key que tu POS
      queryClient.setQueryData(["mostrar cierre de caja", { id_caja }], cierre);
      queryClient.invalidateQueries({ queryKey: ["mostrar cierre de caja"] });
    },
    onError: (error) => {
      toast.error(error?.message ?? "Error inesperado");
    },
  });

  return (
    <Container>
      <section className="area1">
        <span className="title">Aperturar caja con:</span>

        <InputText2>
          <input
            className="form__field"
            type="number"
            placeholder="Ej: $5000"
            value={montoEfectivo}
            onChange={(e) => {
              setMontoEfectivo(e.target.value);
            }}
          />
        </InputText2>

        <span>en efectivo.</span>

        <article className="contentbtn">
          <Btn1 titulo="OMITIR" funcion={() => mutation.mutateAsync({ monto: 0 })} />
          <Btn1
            titulo="APERTURAR"
            color="#ffffff"
            border="2px"
            bgcolor="#ffbd59"
            funcion={() =>
              mutation.mutateAsync({
                monto: Number.isFinite(Number(montoEfectivo))
                  ? Number(montoEfectivo)
                  : 0,
              })
            }
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
