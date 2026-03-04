import styled from "styled-components";
import { VolverBtn } from "../../../moleculas/VolverBtn";
import { Btn1 } from "../../../moleculas/Btn1";
import { Device } from "../../../../styles/breakpoints";
import { useCierreCajaStore } from "../../../../store/CierreCajaStore";
import { format, isValid } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useMovCajaStore } from "../../../../store/MovCajaStore";
import { FormatearNumeroDinero } from "../../../../utils/Conversiones";
import { useEmpresaStore } from "../../../../store/EmpresaStore";
import { PantallaConteoCaja } from "./PantallaConteoCaja";
export function PantallaCierreCaja() {
  const { setStateCierraCaja, dataCierreCaja,stateConteoCaja,setStateConteoCaja } = useCierreCajaStore();
  const {
    mostrarEfectivoSinVentasMovcierrecaja,
    mostrarVentasMetodoPagoMovCaja,
    totalVentasMetodoPago,
    totalVentasEfectivo,
    totalVentasTarjeta,
    totalAperturaCaja,
    totalGastosVariosCaja,
    totalIngresosVariosCaja,
    totalGastosVariosTarjeta,
    totalIngresosVariosTarjeta,
    totalEfectivoTotalCaja,
  } = useMovCajaStore();
  const { dataempresa } = useEmpresaStore();
  const fechaInicio = dataCierreCaja?.fechainicio
    ? new Date(dataCierreCaja.fechainicio)
    : null;
  const fechaFin = new Date();
  const fechaInicioFormateada =
    fechaInicio && isValid(fechaInicio)
      ? format(fechaInicio, "dd/MM/yyyy HH:mm:ss")
      : "--";
  const fechaFinFormateada =
    fechaFin && isValid(fechaFin) ? format(fechaFin, "dd/MM/yyyy HH:mm:ss") : "--";
  const {
    isLoading: isloading1,
    isError: iserror1,
    error: error1,
  } = useQuery({
    queryKey: ["mostrar efectivo sin ventas movCaja"],
    queryFn: () =>
      mostrarEfectivoSinVentasMovcierrecaja({
        _id_cierre_caja: dataCierreCaja?.id,
      }),
    enabled: !!dataCierreCaja?.id,
  });
  const {
    isLoading: isloading2,
    isError: iserror2,
    error: error2,
  } = useQuery({
    queryKey: ["mostrar ventas metodoPago movCaja"],
    queryFn: () =>
      mostrarVentasMetodoPagoMovCaja({ _id_cierre_caja: dataCierreCaja?.id }),
    enabled: !!dataCierreCaja?.id,
  });
  const isLoading = isloading1 || isloading2;
  const isError = iserror1 || iserror2;
  const error = error1 || error2;
  if (isLoading) {
    return <span>cargando datos...</span>;
  }
  if (isError) {
    return <span>error...{error.message} </span>;
  }
  if (!dataCierreCaja?.id) {
    return (
      <Container>
        <VolverBtn funcion={() => setStateCierraCaja(false)} />
        <span>No hay una caja abierta para cerrar.</span>
      </Container>
    );
  }
  const totalDebito =
    totalVentasTarjeta + totalIngresosVariosTarjeta - totalGastosVariosTarjeta;

  return (
    <Container>
      <VolverBtn funcion={()=>setStateCierraCaja(false)} />

      <Fechas>
        Corte de caja | Apertura: {fechaInicioFormateada} | Cierre: {fechaFinFormateada}
      </Fechas>
      <Datos>
        <section>
          Ventas Totales:{" "}
          <span>
            {FormatearNumeroDinero(
              totalVentasMetodoPago,
              dataempresa?.currency,
              dataempresa?.iso
            )}{" "}
          </span>
        </section>
        <section>
          Efectivo en CAJA:{" "}
          <span>
            {FormatearNumeroDinero(
              totalEfectivoTotalCaja,
              dataempresa?.currency,
              dataempresa?.iso
            )}{" "}
          </span>
        </section>
      </Datos>
      <Division></Division>

      <Resumen>
        <Tablas>
          <Tabla>
            <h4>Dinero en EFECTIVO</h4>
            <ul>
              <li>
                Fondo de caja:{" "}
                <span>
                  {FormatearNumeroDinero(
                    totalAperturaCaja,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li>
                Ventas en efectivo:{" "}
                <span>
                  {" "}
                  {FormatearNumeroDinero(
                    totalVentasEfectivo,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>

              <li>
                Ingresos varios:{" "}
                <span>
                  {FormatearNumeroDinero(
                    totalIngresosVariosCaja,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li>
                Egresos varios:{" "}
                <span style={{ color: "#f15050", fontWeight: "bold" }}>-
                  {FormatearNumeroDinero(
                    totalGastosVariosCaja,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li className="total">
                <Divider />
                {FormatearNumeroDinero(
                  totalEfectivoTotalCaja,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </li>
            </ul>
          </Tabla>
          <DivisionY />
          <Tabla>
            <h4>Dinero en DEBITO</h4>
            <ul>
              <li>
                Ventas en debito:{" "}
                <span>
                  {FormatearNumeroDinero(
                    totalVentasTarjeta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li>
                Ingresos varios:{" "}
                <span>
                  {FormatearNumeroDinero(
                    totalIngresosVariosTarjeta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li>
                Egresos varios:{" "}
                <span style={{ color: "#f15050", fontWeight: "bold" }}>-
                  {FormatearNumeroDinero(
                    totalGastosVariosTarjeta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li className="total">
                <Divider />
                {FormatearNumeroDinero(
                  totalDebito,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </li>
            </ul>
          </Tabla>
          <DivisionY />
          <Tabla>
            <h4>Ventas Totales</h4>
            <ul>
              <li>
                En efectivo:{" "}
                <span>
                  {FormatearNumeroDinero(
                    totalVentasEfectivo,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li>
                En debito:{" "}
                <span>
                  {FormatearNumeroDinero(
                    totalVentasTarjeta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </li>
              <li className="total">
                <Divider />
                {FormatearNumeroDinero(
                  totalVentasMetodoPago,
                  dataempresa?.currency,
                  dataempresa?.iso
                )}
              </li>
            </ul>
          </Tabla>
        </Tablas>
      </Resumen>
      <Btn1 funcion={()=>setStateConteoCaja(true)}
        titulo={"CERRAR CAJA"}
        color="#ffffff"
        border="2px"
        bgcolor="#ffbd59"
      />
{
  stateConteoCaja && <PantallaConteoCaja/>
}
      
    </Container>
  );
}

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.color2};
  margin-right: 10px;
`;
const DivisionY = styled.span`
  width: 1px;
  border-radius: 15px;
  margin: 20px 0;
  position: relative;
  text-align: center;
  display: none;
  border-left: 1px dashed ${({ theme }) => theme.color2};
  height: 95%;
  @media ${Device.tablet} {
    display: block;
  }
`;
const Division = styled.span`
  background-color: ${({ theme }) => theme.color2};
  height: 1px;
  border-radius: 15px;
  margin: 20px 0;
  position: relative;
  text-align: center;
  display: block;
  width: 95%;
`;
// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.bgtotal || "#fff"};
  gap: 20px;
  position: absolute;
  width: 100%;
  justify-content: center;
  z-index: 10;
`;

const Fechas = styled.p`
  font-size: 14px;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const Resumen = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Datos = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-around;
  width: 100%;
`;

const Tablas = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: center;
  gap: 20px;
  width: min(100%, 1100px);
  padding: 0 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

const Tabla = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: min(100%, 320px);
  h4 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
  }

  li {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    margin-bottom: 4px;
  }

  .total {
    font-weight: bold;
    margin-top: 8px;
    display: flex;
    justify-content: flex-end;
  }
`;
