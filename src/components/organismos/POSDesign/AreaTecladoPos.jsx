import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { TotalPos } from "./TotalPos";
import { Device } from "../../../styles/breakpoints";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";

export function AreaTecladoPos() {
  const { setStatePantallaCobro, stateMetodosPago } = useCartVentasStore();
  const { dataMetodosPago: datametodospago } = useMetodosPagoStore();

  return (
    <Container stateMetodosPago={stateMetodosPago}>
      <section className="areatipopago">
        {/* FILTRO APLICADO AQUI: Solo permitimos Efectivo y Tarjeta */}
        {datametodospago
          ?.filter((item) => item.nombre === "Efectivo" || item.nombre === "Tarjeta")
          .map((item, index) => {
            return (
              <article className="box" key={index}>
                <Btn1
                  imagen={item.icono != "-" ? item.icono : null}
                  funcion={() =>
                    setStatePantallaCobro({ tipocobro: item.nombre })
                  }
                  titulo={item.nombre}
                  border="0"
                  height="70px"
                  width="100%"
                />
              </article>
            );
          })}
      </section>
      <section className="totales">
        <TotalPos />
      </section>
    </Container>
  );
}

// --- ESTILOS ---
const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.color2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
  width: calc(100% - 5px);
  border-radius: 15px;
  @media ${Device.desktop} {
    position: relative;
    width: 450px;
    bottom: initial;
  }
  .areatipopago {
    display: ${({ stateMetodosPago }) => (stateMetodosPago ? "flex" : "none")};
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
    @media ${Device.desktop} {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px;
    }
    .box {
      flex: 1 1 40%;
      display: flex;
      gap: 10px;
    }
  }
  .totales {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    .subtotal {
      display: none;
      flex-direction: column;
      justify-content: end;
      text-align: end;
      gap: 10px;
      font-weight: 500;
      @media ${Device.desktop} {
        display: flex;
      }
    }
  }
`;