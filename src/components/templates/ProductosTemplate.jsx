import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  TablaProductos,
  Title,
  useProductosStore,
} from "../../index"; // <--- MANTENEMOS TU IMPORT ORIGINAL
import { v } from "../../styles/variables";
import { useEffect, useState } from "react";
import ConfettiExplosion from "react-confetti-explosion";
// Importamos el nuevo modal
import { AumentarPrecio } from "../organismos/formularios/AumentarPrecio";

export function ProductosTemplate() {
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataProductos, setBuscador, generarCodigo } = useProductosStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);

  // --- ESTADOS NUEVOS PARA LA SELECCIÓN ---
  const [rowSelection, setRowSelection] = useState({});
  const [openAumento, setOpenAumento] = useState(false);
  // Convertimos la selección a un array de IDs
  const selectedIds = Object.keys(rowSelection).map((key) => parseInt(key));

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false);
    generarCodigo();
  }

  return (
    <Container>
      {openRegistro && (
        <RegistrarProductos
          setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
          state={openRegistro}
        />
      )}

      {/* --- MODAL DE AUMENTO --- */}
      {openAumento && (
        <AumentarPrecio 
          selectedIds={selectedIds}
          setIsExploding={setIsExploding}
          onClose={() => {
             setOpenAumento(false);
             setRowSelection({}); // Limpiar selección al terminar
          }}
        />
      )}

      <section className="area1">
        <Title>Productos</Title>
        
        {/* --- BOTÓN NUEVO (Solo aparece si seleccionas productos) --- */}
        {selectedIds.length > 0 && (
             <Btn1 
               funcion={() => setOpenAumento(true)}
               bgcolor="#F3D20C" 
               color="#000"
               titulo={`Aumentar precios (${selectedIds.length})`} 

             />
        )}
        {/* --------------------------------------------------------- */}

        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
      </section>

      <section className="area2">
        <Buscador setBuscador={setBuscador} />
      </section>

      <section className="main">
        {isExploding && <ConfettiExplosion />}
        <TablaProductos 
            setdataSelect={setdataSelect} 
            setAccion={setAccion} 
            SetopenRegistro={SetopenRegistro} 
            data={dataProductos} 
            
            // --- PASAMOS LA SELECCIÓN A LA TABLA ---
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
        />
      </section>
    </Container>
  );
}

const Container = styled.div`
  height: calc(100vh - 80px);
  margin-top: 50px;
  padding: 15px;
  display: grid;
  grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;
  
  .area1 {
    grid-area: area1;
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 15px;
  }
  .area2 {
    grid-area: area2;
    display: flex;
    justify-content: end;
    align-items: center;
  }
  .main {
    grid-area: main;
  }
`;