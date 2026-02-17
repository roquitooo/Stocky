import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarCategorias,
  Title,
  useCategoriasStore,
} from "../../index";
import { v } from "../../styles/variables";
import { TablaCategorias } from "../organismos/tablas/TablaCategorias";
import { useState } from "react";
import { RegistrarMetodosPago } from "../organismos/formularios/RegistrarMetodosPago";
import { TablaMetodosPago } from "../organismos/tablas/TablaMetodosPago";

import { useMetodosPagoStore } from "../../store/MetodosPagoStore";
export function MetodosPagoTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataMetodosPago } = useMetodosPagoStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false)
  }
  return (
    <Container>
      {openRegistro && (
        <RegistrarMetodosPago setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="area1">
        <Title>Métodos de pago</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
      </section>
     

      <section className="main">
        <TablaMetodosPago setdataSelect={setdataSelect} setAccion={setAccion} SetopenRegistro={SetopenRegistro} data={dataMetodosPago} />
      </section>
    </Container>
  );
}
const Container = styled.div`
  min-height: calc(100dvh - 80px);
  margin-top: 50px;
  padding: 15px;
  display: grid;
  grid-template:
    "area1" auto
    "main" 1fr;
  gap: 10px;
  .area1 {
    grid-area: area1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }
  .main {
    grid-area: main;
    min-width: 0;
  }

  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 10px;
    .area1 {
      justify-content: flex-start;
    }
  }
`;

