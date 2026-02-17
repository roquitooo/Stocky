import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { TotalPos } from "./TotalPos";
import { Device } from "../../../styles/breakpoints";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useVentasStore } from "../../../store/VentasStore";

export function AreaTecladoPos() {
  const { setStatePantallaCobro, items } = useCartVentasStore();
  const { dataMetodosPago: datametodospago } = useMetodosPagoStore();
  const { validarStockCarrito } = useVentasStore();

  const handleSeleccionarPago = async (nombreMetodo) => {
    const esValido = await validarStockCarrito(items);
    if (esValido) {
      setStatePantallaCobro({ tipocobro: nombreMetodo });
    }
  };

  return (
    <Container>
      <section className="areatipopago">
        {datametodospago
          ?.filter((item) => item.nombre === "Efectivo" || item.nombre === "Tarjeta")
          .map((item, index) => {
            return (
              <article className="box" key={index}>
                <Btn1
                  imagen={item.icono != "-" ? item.icono : null}
                  funcion={() => handleSeleccionarPago(item.nombre)}
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

// ... (Estilos iguales) ...
const Container = styled.div`
  border: 1px solid ${({ theme }) => theme.color2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  bottom: initial;
  width: 100%;
  border-radius: 15px;
  flex-shrink: 0;
  z-index: 2;
  @media ${Device.desktop} {
    position: relative;
    width: clamp(320px, 34vw, 450px);
    bottom: initial;
  }
  .areatipopago {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
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

