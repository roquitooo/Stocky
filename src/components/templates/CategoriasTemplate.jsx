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
export function CategoriasTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { datacategorias,setBuscador } = useCategoriasStore();
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
        <RegistrarCategorias setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
        />
      )}
      <section className="area1">
        <Title>Categorias</Title>
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
      </section>
      <section className="area2">
        <div className="search-wrap">
          <Buscador setBuscador={setBuscador}/>
        </div>
      </section>

      <section className="main">
        <TablaCategorias setdataSelect={setdataSelect} setAccion={setAccion} SetopenRegistro={SetopenRegistro} data={datacategorias} />
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
    "area2" auto
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
  .area2 {
    grid-area: area2;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: wrap;
  }
  .search-wrap {
    flex: 1 1 280px;
    min-width: 220px;
  }
  .main {
    grid-area: main;
    min-width: 0;
  }

  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 10px;
    .area1,
    .area2 {
      justify-content: flex-start;
    }
    .search-wrap {
      flex: 1 1 100%;
      min-width: 0;
    }
  }
`;
