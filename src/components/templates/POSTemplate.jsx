import styled from "styled-components";
import { Device } from "../../styles/breakpoints";
import { blur_in } from "../../styles/keyframes";
import { v } from "../../styles/variables";
import { PantallaCierreCaja } from "../organismos/POSDesign/CajaDesign/PantallaCierreCaja";
import {
  AreaDetalleventaPos,
  AreaTecladoPos,
  Btn1,
  FooterPos,
  HeaderPos,
  InputText2,
  Reloj,
  useCartVentasStore,
} from "../../index";
import { PantallaCobro } from "../organismos/POSDesign/PantallaCobro";

import { PantallaIngresoSalidaDinero } from "../organismos/POSDesign/CajaDesign/PantallaIngresoSalidaDinero";
import { useCierreCajaStore } from "../../store/CierreCajaStore";
export function POSTemplate() {
  const { statePantallaCobro } = useCartVentasStore();
  const { stateIngresoSalida, stateCierreCaja } = useCierreCajaStore();
  return (
    <Container>
      {statePantallaCobro && <PantallaCobro />}

      <HeaderPos />
      <Main>

        <AreaDetalleventaPos />
        <AreaTecladoPos />
      </Main>
      <FooterPos />
      {stateIngresoSalida && <PantallaIngresoSalidaDinero />}
      {stateCierreCaja && <PantallaCierreCaja />}
    </Container>
  );
}
const Container = styled.div`
  height: calc(100dvh - 60px);
  min-height: calc(100vh - 60px);
  padding: 10px;
  padding-top: 50px;
  display: grid;
  gap: 10px;
  grid-template:
    "header" auto
    "main" minmax(0, 1fr);

  animation: ${blur_in} 0.5s linear both;
  @media ${Device.desktop} {
    grid-template:
      "header header" 190px
      "main main" minmax(0, 1fr)
      "footer footer" 78px;
  }
`;

const Main = styled.div`
  grid-area: main;
  /* background-color: rgba(228, 20, 20, 0.5); */
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  overflow: hidden;
  min-height: 0;
  gap: 10px;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 74px);

  @media ${Device.desktop} {
    flex-direction: row;
    padding-bottom: 0;
  }
`;
