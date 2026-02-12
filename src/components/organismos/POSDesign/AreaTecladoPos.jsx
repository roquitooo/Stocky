import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { TotalPos } from "./TotalPos";
import { Device } from "../../../styles/breakpoints";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useVentasStore } from "../../../store/VentasStore";

export function AreaTecladoPos() {
  const { setStatePantallaCobro, stateMetodosPago, items } = useCartVentasStore();
  const { dataMetodosPago: datametodospago } = useMetodosPagoStore();
  const { validarStockCarrito } = useVentasStore();

  const handleSeleccionarPago = (nombreMetodo) => {
    // --- 🕵️‍♂️ MODO DETECTIVE: Ver qué hay en el carrito ---
    console.log("--- INTENTO DE COBRO ---");
    console.log("Items en carrito:", items);
    
    // Verificamos item por item en la consola
    items.forEach((item, index) => {
       console.log(`Producto ${index}: ${item.nombre}`);
       console.log(`- Stock: ${item.stock}`);
       console.log(`- Cantidad pedida: ${item._cantidad}`);
       console.log(`- Maneja Inventarios: ${item.maneja_inventarios}`);
    });

    // Validamos
    const esValido = validarStockCarrito(items);
    console.log("Resultado Validación:", esValido ? "APROBADO ✅" : "RECHAZADO ❌");

    if (esValido) {
      setStatePantallaCobro({ tipocobro: nombreMetodo });
    }
  };

  return (
    <Container stateMetodosPago={stateMetodosPago}>
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
  position: absolute;
  bottom: 10px;
  width: calc(100% - 5px);
  border-radius: 15px;
  @media ${Device.desktop} {
    position: relative;
    width: clamp(320px, 34vw, 450px);
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
