import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { Device } from "../../../styles/breakpoints";
import { useCartVentasStore, useEmpresaStore } from "../../..";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";

export function TotalPos() {
  const { total, setStateMetodosPago } = useCartVentasStore();
  const { dataempresa } = useEmpresaStore();

  return (
    <Container>
      {/* Eliminamos o comentamos la sección imagen si no se usa para que no descuadre el centro */}
      {/* <section className="imagen"></section> */}
      
      <section className="contentTotal">
        <section className="contentTituloTotal">
          <Btn1
            border="2px"
            bgcolor="#ffbd59"
            color="#ffbd59"
            funcion={setStateMetodosPago}
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

// --- ESTILOS CORREGIDOS ---
const Container = styled.div`
  display: flex;
  text-align: center;
  /* CAMBIO 1: Centrar todo el contenido horizontal y verticalmente */
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
  height: 100%; /* Asegura que ocupe el alto disponible si es necesario */

  &::after {
    content: "";
    display: block;
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.2); /* Un poco de transparencia para el efecto */
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
    /* CAMBIO 2: Asegurar que el contenido interno también esté centrado */
    align-items: center; 
    justify-content: center;
    width: 100%;

    .contentTituloTotal {
      display: flex;
      align-items: center;
      position: relative;
      margin-bottom: 5px; /* Pequeño margen si aparece el botón */
      
      @media ${Device.desktop} {
        display: none;
      }
    }
  }
`;