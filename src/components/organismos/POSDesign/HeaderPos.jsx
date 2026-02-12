import styled from "styled-components";
import {
  Btn1,
  InputText2,
  ListaDesplegable,
  Reloj,
  useProductosStore,
  useSucursalesStore,
  useUsuariosStore,
  useCartVentasStore,
} from "../../../index";
import { v } from "../../../styles/variables";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

export function HeaderPos() {
  const [stateLectora, setStateLectora] = useState(false);
  const [stateTeclado, setStateTeclado] = useState(true);

  const [cantidadInput, setCantidadInput] = useState(1);
  const [stateListaproductos, setStateListaproductos] = useState(false);

  const { setBuscador, dataProductos, selectProductos, buscador } =
    useProductosStore();

  const { sucursalesItemSelect } = useSucursalesStore();
  const { datausuarios } = useUsuariosStore();

  const asignacionActiva = Array.isArray(sucursalesItemSelect)
    ? sucursalesItemSelect[0]
    : sucursalesItemSelect;

  const id_sucursal_seguro =
    asignacionActiva?.id_sucursal ?? asignacionActiva?.id ?? null;

  const { addItem } = useCartVentasStore();
  const buscadorRef = useRef(null);

  // --- LÓGICA DE LECTORA CORREGIDA ---
  
  const ejecutarVentaPorLectora = (codigo) => {
    if (!codigo) return;

    const valorAEscanear = codigo.toString().trim();
    
    // Buscamos en dataProductos comparando con 'codigo_barras' o 'codigo'
    const productoEncontrado = dataProductos.find((p) => {
      const cb = p.codigo_barras?.toString().trim();
      const c = p.codigo?.toString().trim();
      return cb === valorAEscanear || c === valorAEscanear;
    });

    if (productoEncontrado) {
      const cantidad = parseFloat(cantidadInput) || 1;
      
      const pDetalleVentas = {
        _id_venta: 1,
        _cantidad: cantidad,
        _precio_venta: productoEncontrado.precio_venta,
        _total: cantidad * productoEncontrado.precio_venta,
        _descripcion: productoEncontrado.nombre,
        _id_producto: productoEncontrado.id,
        _precio_compra: productoEncontrado.precio_compra,
        _id_sucursal: id_sucursal_seguro,
        stock: productoEncontrado.stock,
        maneja_inventarios: productoEncontrado.maneja_inventarios,
        nombre: productoEncontrado.nombre,
      };

      addItem(pDetalleVentas);
      setBuscador(""); // Limpia el input para el siguiente escaneo
      setCantidadInput(1);
    } else {
      console.warn("Producto no encontrado:", valorAEscanear);
      setBuscador("");
    }
  };

  // Mantener el foco automático si la lectora está activa
  useEffect(() => {
    const handleGlobalClick = () => {
      if (stateLectora && buscadorRef.current) {
        buscadorRef.current.focus();
      }
    };
    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, [stateLectora]);

  // --- FUNCIONES DE INTERFAZ ---

  function focusclick() {
    if (buscadorRef.current) {
      buscadorRef.current.focus();
      if (buscadorRef.current.value.trim() === "" || stateLectora) {
        setStateListaproductos(false);
      } else {
        setStateListaproductos(true);
      }
    }
  }

  function buscar(e) {
    const texto = e.target.value;
    setBuscador(texto);
    
    if (texto.trim() === "" || stateLectora) {
      setStateListaproductos(false);
    } else {
      setStateListaproductos(true);
    }
  }

  async function funcion_insertarventas() {
    const productosItemSelect = useProductosStore.getState().productosItemSelect;
    if (!id_sucursal_seguro || !productosItemSelect) return;

    const cantidad = parseFloat(cantidadInput) || 1;
    const pDetalleVentas = {
      _id_venta: 1,
      _cantidad: cantidad,
      _precio_venta: productosItemSelect.precio_venta,
      _total: cantidad * productosItemSelect.precio_venta,
      _descripcion: productosItemSelect.nombre,
      _id_producto: productosItemSelect.id,
      _precio_compra: productosItemSelect.precio_compra,
      _id_sucursal: id_sucursal_seguro,
      stock: productosItemSelect.stock,
      maneja_inventarios: productosItemSelect.maneja_inventarios,
      nombre: productosItemSelect.nombre,
    };

    addItem(pDetalleVentas);
    setBuscador("");
    setCantidadInput(1);
    if (buscadorRef.current) buscadorRef.current.focus();
  }

  const ValidarCantidad = (e) => {
    const value = Math.max(0, parseFloat(e.target.value));
    setCantidadInput(value);
  };

  useEffect(() => {
    setTimeout(() => {
      if (buscadorRef.current) buscadorRef.current.focus();
    }, 100);
  }, []);

  return (
    <Header>
      <ContentSucursal>
        <strong>SUCURSAL:&nbsp; </strong>{" "}
        {asignacionActiva?.sucursal || asignacionActiva?.nombre || "Cargando..."}
      </ContentSucursal>

      <section className="contentprincipal">
        <Contentuser className="area1">
          <div className="contentimg">
            <img src="https://i.ibb.co/bgCsdz5H/1487716857-user-81635.webp" alt="user" />
          </div>
          <div className="textos">
            <span className="usuario">{datausuarios?.nombres || "Cajero"}</span>
            <span>Turno Actual</span>
          </div>
        </Contentuser>

        <article className="contentlogo area2">
          <img src={v.logo} alt="logo" />
          <span>STOCKY</span>
        </article>

        <article className="contentfecha area3">
          <Reloj />
        </article>
      </section>

      <section className="contentbuscador">
        <article className="area1">
          <div className="contentCantidad">
            <InputText2>
              <input
                type="number"
                min="1"
                value={cantidadInput}
                onChange={ValidarCantidad}
                placeholder="cantidad..."
                className="form__field"
              />
            </InputText2>
          </div>

          <InputText2>
            <input
              autoFocus
              value={buscador}
              ref={buscadorRef}
              onChange={buscar}
              className="form__field"
              type="search"
              placeholder={stateLectora ? "Escanee producto..." : "Buscar producto..."}
              onKeyDown={(e) => {
                // Capturar el Enter de la lectora
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (stateLectora) {
                    ejecutarVentaPorLectora(buscador);
                  }
                }
                if (e.key === "ArrowDown" && stateListaproductos) {
                  e.preventDefault();
                }
              }}
            />

            <ListaDesplegable
              funcioncrud={funcion_insertarventas}
              top="59px"
              funcion={selectProductos}
              setState={() => setStateListaproductos(!stateListaproductos)}
              data={dataProductos}
              state={stateListaproductos}
            />
          </InputText2>
        </article>

        <article className="area2">
          <Btn1
            funcion={() => {
              setStateLectora(true);
              setStateTeclado(false);
              setStateListaproductos(false);
              focusclick();
            }}
            bgcolor={stateLectora ? "#ffbd59" : ({ theme }) => theme.bgtotal}
            color={stateLectora ? "#fff" : ({ theme }) => theme.text}
            border="2px"
            titulo="Lectora"
            icono={<Icon icon="material-symbols:barcode-reader-outline" />}
          />
          <Btn1
            funcion={() => {
              setStateLectora(false);
              setStateTeclado(true);
              focusclick();
            }}
            bgcolor={stateTeclado ? "#ffbd59" : ({ theme }) => theme.bgtotal}
            color={stateTeclado ? "#fff" : ({ theme }) => theme.text}
            border="2px"
            titulo="Teclado"
            icono={<Icon icon="icon-park:enter-the-keyboard" />}
          />
        </article>
      </section>
    </Header>
  );
}

// Estilos se mantienen iguales...
const Header = styled.div`
  grid-area: header;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 20px;
  @media ${Device.desktop} {
    border-bottom: 1px solid ${({ theme }) => theme.color2};
  }
  .contentprincipal {
    width: 100%;
    display: grid;
    grid-template-areas: "area1 area2" "area3 area3";
    .area1 { grid-area: area1; }
    .area2 { grid-area: area2; }
    .area3 { grid-area: area3; }
    @media ${Device.desktop} {
      display: flex;
      justify-content: space-between;
    }
    .contentlogo {
      display: flex;
      align-items: center;
      font-weight: 700;
      img { width: 30px; object-fit: contain; }
    }
    @media (max-width: 520px) {
      gap: 8px;
      .contentlogo span {
        font-size: 13px;
      }
    }
  }
  .contentbuscador {
    display: grid;
    grid-template: "area2 area2" "area1 area1";
    gap: 10px;
    height: 100%;
    align-items: center;
    position: relative;
    .area1 {
      grid-area: area1;
      display: flex;
      gap: 30px;
      .contentCantidad { width: 150px; }
    }
    .area2 { grid-area: area2; display: flex; gap: 10px; }
    @media ${Device.desktop} {
      display: flex;
      justify-content: flex-start;
      gap: 10px;
      .area1 { width: 40vw; }
    }
    @media (max-width: 640px) {
      .area1 {
        gap: 10px;
        width: 100%;
        .contentCantidad {
          width: 95px;
        }
      }
      .area2 {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }
`;

const ContentSucursal = styled.section`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 45px;
  border-bottom: 1px solid ${({ theme }) => theme.color2};
`;

const Contentuser = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  .contentimg {
    display: flex;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    img { width: 100%; object-fit: cover; }
  }
  .textos {
    display: flex;
    flex-direction: column;
    .usuario { font-weight: 700; }
  }
`;
