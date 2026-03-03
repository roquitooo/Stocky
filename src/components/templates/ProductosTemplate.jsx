import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  TablaProductos,
  Title,
  useCategoriasStore,
  useProductosStore,
  useUsuariosStore,
} from "../../index";
import { v } from "../../styles/variables";
import { useEffect, useMemo, useRef, useState } from "react";
import { AumentarPrecio } from "../organismos/formularios/AumentarPrecio";
import { BarLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";

function obtenerIdCategoriaProducto(producto, categoriasPorNombre = new Map()) {
  if (!producto || typeof producto !== "object") return "";

  const posiblesIds = [
    producto.id_categoria,
    producto.idCategoria,
    producto.idcategoria,
    producto._id_categoria,
    producto.categoria_id,
    producto.id_cat,
    producto?.categoria?.id,
    producto?.categorias?.id,
  ];

  for (const value of posiblesIds) {
    const id = String(value ?? "").trim();
    if (id) return id;
  }

  const posiblesNombres = [
    producto.categoria,
    producto.nombre_categoria,
    producto.categoria_nombre,
    producto?.categoria?.nombre,
    producto?.categorias?.nombre,
  ];

  for (const value of posiblesNombres) {
    const nombre = String(value ?? "").trim().toLowerCase();
    if (!nombre) continue;
    const idDesdeNombre = categoriasPorNombre.get(nombre);
    if (idDesdeNombre) return idDesdeNombre;
  }

  return "";
}

export function ProductosTemplate({
  isLoading,
  lowStockProductIds = [],
  isLoadingLowStock = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openRegistro, SetopenRegistro] = useState(false);
  const { datausuarios } = useUsuariosStore();
  const { dataProductos, setBuscador, generarCodigo } = useProductosStore();
  const { datacategorias } = useCategoriasStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [isExploding, setIsExploding] = useState(false);
  const [openCategoriasFiltro, setOpenCategoriasFiltro] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const filtroCategoriasRef = useRef(null);
  const [rowSelection, setRowSelection] = useState({});
  const [openAumento, setOpenAumento] = useState(false);
  const selectedIds = Object.keys(rowSelection).map((key) => parseInt(key, 10));
  const filtroBajoStock =
    new URLSearchParams(location.search).get("filtro") === "bajo-stock";
  const esCajero = String(datausuarios?.roles?.nombre || "")
    .toLowerCase()
    .includes("cajero");

  const categoriasDisponibles = useMemo(() => {
    if (!Array.isArray(datacategorias)) return [];

    const ids = new Set();
    return datacategorias.reduce((acc, categoria) => {
      const id = String(categoria?.id ?? "").trim();
      const nombre = String(categoria?.nombre ?? "").trim();
      if (!id || !nombre || ids.has(id)) return acc;
      ids.add(id);
      acc.push({ id, nombre });
      return acc;
    }, []);
  }, [datacategorias]);

  const categoriasPorNombre = useMemo(() => {
    const mapa = new Map();
    categoriasDisponibles.forEach((categoria) => {
      mapa.set(categoria.nombre.toLowerCase(), categoria.id);
    });
    return mapa;
  }, [categoriasDisponibles]);

  const lowStockIds = useMemo(
    () => new Set((lowStockProductIds || []).map((id) => Number(id))),
    [lowStockProductIds]
  );

  useEffect(() => {
    setCategoriasSeleccionadas((prev) => {
      const disponibles = new Set(categoriasDisponibles.map((item) => item.id));
      const filtradas = prev.filter((id) => disponibles.has(id));
      return filtradas.length === prev.length ? prev : filtradas;
    });
  }, [categoriasDisponibles]);

  useEffect(() => {
    if (!openCategoriasFiltro) return undefined;

    function cerrarAlClickAfuera(event) {
      if (
        filtroCategoriasRef.current &&
        !filtroCategoriasRef.current.contains(event.target)
      ) {
        setOpenCategoriasFiltro(false);
      }
    }

    document.addEventListener("mousedown", cerrarAlClickAfuera);
    return () => document.removeEventListener("mousedown", cerrarAlClickAfuera);
  }, [openCategoriasFiltro]);

  const productosFiltrados = useMemo(() => {
    let productosBase = dataProductos || [];

    if (filtroBajoStock) {
      productosBase = productosBase.filter((item) =>
        lowStockIds.has(Number(item?.id))
      );
    }

    if (!categoriasSeleccionadas.length) return productosBase;

    const categoriasSet = new Set(categoriasSeleccionadas.map((id) => String(id)));
    return productosBase.filter((producto) => {
      const idCategoria = obtenerIdCategoriaProducto(producto, categoriasPorNombre);
      return idCategoria && categoriasSet.has(String(idCategoria));
    });
  }, [
    dataProductos,
    filtroBajoStock,
    lowStockIds,
    categoriasSeleccionadas,
    categoriasPorNombre,
  ]);

  const totalCategorias = categoriasDisponibles.length;
  const todasLasCategoriasSeleccionadas =
    totalCategorias > 0 && categoriasSeleccionadas.length === totalCategorias;
  const textoChipCategorias =
    categoriasSeleccionadas.length === 0
      ? "Filtrar por categorías"
      : `Categorías (${categoriasSeleccionadas.length})`;

  function toggleCategoriaFiltro(idCategoria) {
    const id = String(idCategoria);
    setCategoriasSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((categoriaId) => categoriaId !== id)
        : [...prev, id]
    );
  }

  function seleccionarTodasCategorias() {
    setCategoriasSeleccionadas(categoriasDisponibles.map((item) => item.id));
  }

  function limpiarFiltroCategorias() {
    setCategoriasSeleccionadas([]);
  }

  function nuevoRegistro() {
    SetopenRegistro(!openRegistro);
    setAccion("Nuevo");
    setdataSelect([]);
    setIsExploding(false);
    generarCodigo();
  }

  function aplicarFiltroBajoStock() {
    navigate("/configuracion/productos?filtro=bajo-stock");
  }

  function limpiarFiltroBajoStock() {
    setBuscador("");
    setCategoriasSeleccionadas([]);
    setOpenCategoriasFiltro(false);
    navigate("/configuracion/productos");
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
          esCajero={esCajero}
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
        <div className="search-wrap">
          <Buscador setBuscador={setBuscador} />
        </div>

        <button
          type="button"
          className={`chip-lowstock ${filtroBajoStock ? "active" : ""}`}
          onClick={aplicarFiltroBajoStock}
        >
          {`Aplicar filtro bajo stock (${isLoadingLowStock ? "..." : lowStockProductIds.length})`}
        </button>

        <button
          type="button"
          className="chip-lowstock clear"
          onClick={limpiarFiltroBajoStock}
        >
          Limpiar filtro
        </button>

        <div className="filtro-categorias" ref={filtroCategoriasRef}>
          <button
            type="button"
            className={`chip-category ${categoriasSeleccionadas.length ? "active" : ""}`}
            onClick={() => setOpenCategoriasFiltro((prev) => !prev)}
          >
            {textoChipCategorias}
          </button>

          {openCategoriasFiltro && (
            <div className="categorias-popover">
              <div className="categorias-actions">
                <button
                  type="button"
                  onClick={seleccionarTodasCategorias}
                  disabled={todasLasCategoriasSeleccionadas || totalCategorias === 0}
                >
                  Seleccionar todas
                </button>
                <button
                  type="button"
                  onClick={limpiarFiltroCategorias}
                  disabled={categoriasSeleccionadas.length === 0}
                >
                  Limpiar
                </button>
              </div>

              <div className="categorias-lista">
                {totalCategorias === 0 ? (
                  <span className="categorias-vacio">No hay categorías disponibles</span>
                ) : (
                  categoriasDisponibles.map((categoria) => (
                    <label key={categoria.id} className="categoria-item">
                      <input
                        type="checkbox"
                        checked={categoriasSeleccionadas.includes(categoria.id)}
                        onChange={() => toggleCategoriaFiltro(categoria.id)}
                      />
                      <span>{categoria.nombre}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="main">
        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "50px",
            }}
          >
            <BarLoader color="#6d6d6d" />
          </div>
        ) : (
          <TablaProductos
            setdataSelect={setdataSelect}
            setAccion={setAccion}
            SetopenRegistro={SetopenRegistro}
            data={productosFiltrados}
            ocultarPrecioCompra={esCajero}
            rowSelection={rowSelection}
            setRowSelection={setRowSelection}
          />
        )}
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
    gap: 10px;
  }

  .search-wrap {
    flex: 1 1 280px;
    min-width: 220px;
  }

  .main {
    grid-area: main;
    min-width: 0;
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

  .chip-lowstock.active {
    border-color: #f2b84f;
    background: linear-gradient(180deg, #ffcf79 0%, #ffbd59 100%);
    color: #7d4a00;
  }

  .chip-lowstock.clear {
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
  }

  .filtro-categorias {
    position: relative;
  }

  .chip-category {
    border: 1px solid ${({ theme }) => theme.color2};
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    font-weight: 700;
    border-radius: 999px;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
  }

  .chip-category.active {
    border-color: #f2b84f;
    color: #7d4a00;
    background: linear-gradient(180deg, #ffcf79 0%, #ffbd59 100%);
  }

  .categorias-popover {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: min(320px, 92vw);
    border: 1px solid ${({ theme }) => theme.color2};
    border-radius: 12px;
    background: ${({ theme }) => theme.bgtotal};
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    padding: 10px;
    z-index: 20;
  }

  .categorias-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .categorias-actions button {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
  }

  .categorias-actions button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .categorias-lista {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 240px;
    overflow: auto;
    padding-right: 4px;
  }

  .categoria-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }

  .categoria-item input {
    accent-color: #f3d20c;
    cursor: pointer;
  }

  .categorias-vacio {
    font-size: 12px;
    opacity: 0.8;
    color: ${({ theme }) => theme.text};
  }

  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 10px;

    .area1 {
      justify-content: flex-start;
      gap: 10px;
    }

    .area2 {
      justify-content: flex-start;
    }

    .search-wrap {
      flex: 1 1 100%;
      min-width: 0;
    }

    .chip-lowstock {
      white-space: normal;
      line-height: 1.2;
    }

    .filtro-categorias {
      width: 100%;
    }

    .chip-category {
      width: 100%;
      white-space: normal;
      line-height: 1.2;
    }

    .categorias-popover {
      left: 0;
      right: auto;
      width: 100%;
    }
  }
`;
