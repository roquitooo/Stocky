import styled from "styled-components";
import {
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
import { useEffect, useRef, useState } from "react";

export function HeaderPos() {
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

  const sanitizarCantidadEntera = (value) => {
    const soloDigitos = String(value ?? "").replace(/\D/g, "");
    const cantidad = Number.parseInt(soloDigitos, 10);
    if (Number.isNaN(cantidad) || cantidad <= 0) return 1;
    return cantidad;
  };

  const bloquearTeclasNoEnteras = (e) => {
    if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
      e.preventDefault();
    }
  };

  function agregarProductoAVenta(producto) {
    if (!id_sucursal_seguro || !producto) return;

    const cantidad = sanitizarCantidadEntera(cantidadInput);
    const pDetalleVentas = {
      _id_venta: 1,
      _cantidad: cantidad,
      _precio_venta: producto.precio_venta,
      _total: cantidad * producto.precio_venta,
      _descripcion: producto.nombre,
      _id_producto: producto.id,
      _precio_compra: producto.precio_compra,
      _id_sucursal: id_sucursal_seguro,
      stock: producto.stock,
      maneja_inventarios: producto.maneja_inventarios,
      nombre: producto.nombre,
    };

    addItem(pDetalleVentas);
    setBuscador("");
    setCantidadInput(1);
    setStateListaproductos(false);
    if (buscadorRef.current) buscadorRef.current.focus();
  }

  function buscarProductoPorCodigo(valor) {
    return (dataProductos || []).find((p) => {
      const cb = p.codigo_barras?.toString().trim();
      const c = p.codigo?.toString().trim();
      return cb === valor || c === valor;
    });
  }

  function ejecutarBusquedaRapida(valorEntrada) {
    const valor = valorEntrada?.toString().trim();
    if (!valor) return;

    const productoCodigo = buscarProductoPorCodigo(valor);
    if (productoCodigo) {
      agregarProductoAVenta(productoCodigo);
      return;
    }

    if ((dataProductos || []).length === 1) {
      agregarProductoAVenta(dataProductos[0]);
      return;
    }

    setStateListaproductos((dataProductos || []).length > 1);
  }

  function buscar(e) {
    const texto = e.target.value;
    setBuscador(texto);

    if (texto.trim() === "") {
      setStateListaproductos(false);
    } else {
      setStateListaproductos(true);
    }
  }

  async function funcion_insertarventas() {
    const productosItemSelect = useProductosStore.getState().productosItemSelect;
    if (!productosItemSelect && (dataProductos || []).length === 1) {
      agregarProductoAVenta(dataProductos[0]);
      return;
    }
    agregarProductoAVenta(productosItemSelect);
  }

  const ValidarCantidad = (e) => {
    setCantidadInput(sanitizarCantidadEntera(e.target.value));
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
                step="1"
                inputMode="numeric"
                value={cantidadInput}
                onChange={ValidarCantidad}
                onBlur={() => setCantidadInput(sanitizarCantidadEntera(cantidadInput))}
                onKeyDown={bloquearTeclasNoEnteras}
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
              placeholder="Buscar o escanear producto..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  ejecutarBusquedaRapida(buscador);
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
      </section>
    </Header>
  );
}

const Header = styled.div`
  grid-area: header;
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 12px;
  @media ${Device.desktop} {
    border-bottom: 1px solid ${({ theme }) => theme.color2};
  }
  .contentprincipal {
    width: 100%;
    display: grid;
    grid-template-areas: "area1 area2" "area3 area3";
    align-items: center;
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
    .contentfecha {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      min-width: 170px;
      flex-shrink: 0;
    }
    @media (max-width: 520px) {
      gap: 8px;
      .contentlogo span {
        font-size: 13px;
      }
      .contentfecha {
        min-width: 100%;
        justify-content: center;
      }
    }
  }
  .contentbuscador {
    display: flex;
    align-items: center;
    position: relative;
    .area1 {
      width: 100%;
      display: flex;
      gap: 30px;
      .contentCantidad { width: 150px; }
    }
    @media ${Device.desktop} {
      .area1 { width: 40vw; }
    }
    @media (max-width: 640px) {
      .area1 {
        gap: 10px;
        .contentCantidad {
          width: 95px;
        }
      }
    }
  }
`;

const ContentSucursal = styled.section`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 38px;
  padding: 4px 8px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.color2};
  text-align: center;
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
