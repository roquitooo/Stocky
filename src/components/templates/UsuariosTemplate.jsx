import styled from "styled-components";
import { TablaUsuarios } from "../organismos/tablas/TablaUsuarios";
import { 
  Btn1, 
  Buscador, 
  ContentFiltros, 
  RegistrarUsuarios, 
  Title, 
  useAsignacionCajaSucursalStore 
} from "../../index";
import { useState } from "react";
import { BarLoader } from "react-spinners"; // Importamos el loader aquí

// Recibimos isLoading como prop
export function UsuariosTemplate({ isLoading }) {
  const [openRegistro, SetopenRegistro] = useState(false);
  const [dataSelect, setdataSelect] = useState([]);
  const [accion, setAccion] = useState("");
  
  const { datausuariosAsignados, setBuscador } = useAsignacionCajaSucursalStore();

  const nuevoRegistro = () => {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
  };

  return (
    <Container>
      {openRegistro && (
        <RegistrarUsuarios
          dataSelect={dataSelect}
          accion={accion}
          onClose={() => SetopenRegistro(false)}
        />
      )}
      
      <section className="area1">
        <ContentFiltros>
          <Title>Usuarios</Title>
          <Btn1 titulo="Nuevo Usuario" funcion={nuevoRegistro} bgcolor="#ffbd58" color="#fff" />
        </ContentFiltros>
      </section>
      
      <section className="area2">
        {/* El Buscador SIEMPRE se renderiza, nunca se desmonta */}
        <Buscador setBuscador={setBuscador} />
      </section>
      
      <section className="main">
        {/* Aquí decidimos: Si carga, mostramos spinner. Si no, la tabla */}
        {isLoading ? (
          <div className="loading-container">
            <BarLoader color="#6d6d6d" />
          </div>
        ) : (
          <TablaUsuarios
            data={datausuariosAsignados} 
            SetopenRegistro={SetopenRegistro}
            setdataSelect={setdataSelect}
            setAccion={setAccion}
          />
        )}
      </section>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  min-height: calc(100dvh - 80px);
  background-color: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  display: grid;
  padding: 15px;
  grid-template:
    "area1" auto
    "area2" auto
    "main" 1fr;
  gap: 10px;
    
  .area1 {
    grid-area: area1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }
  .area2 {
    grid-area: area2;
    display: flex;
    align-items: center;
  }
  .main {
    grid-area: main;
    min-width: 0;
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    padding-top: 50px;
  }

  @media (max-width: 768px) {
    padding: 10px;
    .area2 {
      width: 100%;
    }
  }
`;
