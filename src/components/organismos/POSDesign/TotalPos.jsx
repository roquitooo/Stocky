import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { Device } from "../../../styles/breakpoints";
import { useCartVentasStore, useEmpresaStore } from "../../..";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
// 1. IMPORTAR VENTAS STORE
import { useVentasStore } from "../../../store/VentasStore";

export function TotalPos() {
  const { total, setStateMetodosPago, cart } = useCartVentasStore();
  const { dataempresa } = useEmpresaStore();
  
  // 2. EXTRAER FUNCIÓN VALIDADORA
  const { validarStockCarrito } = useVentasStore();

  // 3. FUNCIÓN INTERMEDIA DE COBRO
  const handleCobrar = () => {
    // Primero validamos stock
    const esValido = validarStockCarrito(cart);
    
    // Solo avanzamos si es válido
    if (esValido) {
      setStateMetodosPago();
    }
  };

  return (
    <Container>
      <section className="contentTotal">
        <section className="contentTituloTotal">
          <Btn1
            border="2px"
            bgcolor="#ffbd59"
            color="#ffbd59"
            funcion={handleCobrar} // <--- USAR handleCobrar, NO setStateMetodosPago
            titulo="COBRAR"
          />
        </section>
        <span>
          {FormatearNumeroDinero(
            total,
            dataempresa?.currency,
            dataempresa?.iso
          )}
        </span>
      </section>
    </Container>
  );
}

// ... (Estilos iguales que antes) ...
const Container = styled.div`
  display: flex;
  text-align: center;
  justify-content: center; 
  align-items: center;
  border-radius: 15px;
  font-weight: 700;
  font-size: 38px;
  background-color: #ffbd59;
  padding: 10px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  height: 100%;

  &::after {
    content: "";
    display: block;
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.2);
    position: absolute;
    border-radius: 50%;
    top: -20px;
    left: -15px;
  }
  &::before {
    content: "";
    display: block;
    width: 20px;
    height: 20px;
    background-color: ${({ theme }) => theme.bgtotal};
    position: absolute;
    border-radius: 50%;
    top: 5px;
    right: 5px;
  }

  .contentTotal {
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center; 
    justify-content: center;
    width: 100%;

    .contentTituloTotal {
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 5px;
      @media ${Device.desktop} {
        display: none;
      }
    }
  }
`;