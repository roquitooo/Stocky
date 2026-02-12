import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  TablaProductos,
  Title,
  useProductosStore,
  Spinner1 // Asegúrate de importar tu spinner aquí si lo usas
} from "../../index"; 
import { v } from "../../styles/variables";
import { useMemo, useState } from "react";
import { AumentarPrecio } from "../organismos/formularios/AumentarPrecio";
import { BarLoader } from "react-spinners"; // O usa Spinner1 si prefieres
import { useLocation, useNavigate } from "react-router-dom";

export function ProductosTemplate({ isLoading, lowStockProductIds = [] }) { // <--- Recibimos isLoading
  const location = useLocation();
  const navigate = useNavigate();
  const [openRegistro, SetopenRegistro] = useState(false);
  const { dataProductos, setBuscador, generarCodigo } = useProductosStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);

  const [rowSelection, setRowSelection] = useState({});
  const [openAumento, setOpenAumento] = useState(false);
  const selectedIds = Object.keys(rowSelection).map((key) => parseInt(key));
  const filtroBajoStock = new URLSearchParams(location.search).get("filtro") === "bajo-stock";
  const productosFiltrados = useMemo(() => {
    if (!filtroBajoStock) return dataProductos || [];
    const ids = new Set((lowStockProductIds || []).map((id) => Number(id)));
    return (dataProductos || []).filter((item) => ids.has(Number(item?.id)));
  }, [dataProductos, filtroBajoStock, lowStockProductIds]);

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
          key={dataSelect?.id || "nuevo"} 
          setIsExploding={setIsExploding}
          onClose={() => SetopenRegistro(!openRegistro)}
          dataSelect={dataSelect}
          accion={accion}
          state={openRegistro}
        />
      )}

      {openAumento && (
        <AumentarPrecio 
          selectedIds={selectedIds}
          setIsExploding={setIsExploding}
          onClose={() => {
             setOpenAumento(false);
             setRowSelection({}); 
          }}
        />
      )}

      <section className="area1">
        <Title>Productos</Title>
        {selectedIds.length > 0 && (
             <Btn1 
               funcion={() => setOpenAumento(true)}
               bgcolor="#F3D20C" 
               color="#000"
               titulo={`Aumentar precios (${selectedIds.length})`} 
             />
        )}
        <Btn1
          funcion={nuevoRegistro}
          bgcolor={v.colorPrincipal}
          titulo="nuevo"
          icono={<v.iconoagregar />}
        />
      </section>

      <section className="area2">
        {/* EL BUSCADOR SIEMPRE VISIBLE */}
        <Buscador setBuscador={setBuscador} />
        {filtroBajoStock && (
          <button
            type="button"
            className="chip-lowstock"
            onClick={() => navigate("/configuracion/productos")}
          >
            Bajo stock activo: {productosFiltrados.length} producto(s) - Quitar filtro
          </button>
        )}
      </section>

      <section className="main">
        {/* LÓGICA DE CARGA SOLO EN EL CUERPO */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
             <BarLoader color="#6d6d6d" /> 
             {/* O puedes usar <Spinner1/> si prefieres */}
          </div>
        ) : (
          <TablaProductos 
              setdataSelect={setdataSelect} 
              setAccion={setAccion} 
              SetopenRegistro={SetopenRegistro} 
              data={productosFiltrados} 
              rowSelection={rowSelection}
              setRowSelection={setRowSelection}
          />
        )}
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
    gap: 10px;
  }
  .main {
    grid-area: main;
  }

  .chip-lowstock {
    border: 1px solid #f2b84f;
    background: linear-gradient(180deg, #ffcf79 0%, #ffbd59 100%);
    color: #7d4a00;
    font-weight: 700;
    border-radius: 999px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
  }
`;
