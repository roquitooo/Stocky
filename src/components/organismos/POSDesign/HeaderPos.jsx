import styled from "styled-components";
import {
  Btn1,
  InputText2,
  ListaDesplegable,
  Reloj,
  useProductosStore,
  useSucursalesStore,
  useCartVentasStore,
} from "../../../index";
import { v } from "../../../styles/variables";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react";
import { useEffect, useRef, useState } from "react";

export function HeaderPos() {
  // CAMBIO 1: Invertimos los estados iniciales
  const [stateLectora, setStateLectora] = useState(false); // Antes true
  const [stateTeclado, setStateTeclado] = useState(true);  // Antes false
  
  const [cantidadInput, setCantidadInput] = useState(1);
  const [stateListaproductos, setStateListaproductos] = useState(false);
  
  const { setBuscador, dataProductos, selectProductos, buscador } = useProductosStore();
  const { sucursalesItemSelectAsignadas } = useSucursalesStore();
  const { addItem } = useCartVentasStore();
  const buscadorRef = useRef(null);

  function focusclick() {
    buscadorRef.current.focus();
    buscadorRef.current.value.trim() === ""
      ? setStateListaproductos(false)
      : setStateListaproductos(true);
  }

  function buscar(e) {
    setBuscador(e.target.value);
    let texto = e.target.value;
    if (texto.trim() === "" || stateLectora) {
      setStateListaproductos(false);
    } else {
      setStateListaproductos(true);
    }
  }

  async function funcion_insertarventas() {
    const productosItemSelect = useProductosStore.getState().productosItemSelect;
    
    // --- CORRECCIÓN: Agregar stock y maneja_inventarios ---
    const pDetalleVentas = {
      _id_venta: 1,
      _cantidad: parseFloat(cantidadInput)|| 1,
      _precio_venta: productosItemSelect.precio_venta,
      _total: 1 * productosItemSelect.precio_venta,
      _descripcion: productosItemSelect.nombre,
      _id_producto: productosItemSelect.id,
      _precio_compra: productosItemSelect.precio_compra,
      _id_sucursal: sucursalesItemSelectAsignadas.id_sucursal,
      
      // NUEVOS DATOS VITALES PARA LA VALIDACIÓN:
      stock: productosItemSelect.stock, 
      maneja_inventarios: productosItemSelect.maneja_inventarios,
      nombre: productosItemSelect.nombre // Aseguramos que el nombre esté accesible
    };
    
    addItem(pDetalleVentas);
    setBuscador("");
    buscadorRef.current.focus();
    setCantidadInput(1);
  }

  const ValidarCantidad = (e) => {
    const value = Math.max(0, parseFloat(e.target.value));
    setCantidadInput(value);
  };

  useEffect(() => {
    // CAMBIO 2: Asegurar el foco al cargar el componente
    setTimeout(() => {
        if(buscadorRef.current) buscadorRef.current.focus();
    }, 100);
  }, []);

  return (
    <Header>
      <ContentSucursal>
        <strong>SUCURSAL:&nbsp; </strong>{" "}
        {sucursalesItemSelectAsignadas?.sucursal}
      </ContentSucursal>
      <section className="contentprincipal">
        <Contentuser className="area1">
          <div className="contentimg">
            <img src="https://i.ibb.co/bgCsdz5H/1487716857-user-81635.webp" />
          </div>
          <div className="textos">
            <span className="usuario">Juan</span>
            <span>Cajero</span>
          </div>
        </Contentuser>
        <article className="contentlogo area2">
          <img src={v.logo} />
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
              autoFocus // CAMBIO 3: Propiedad nativa de autofocus
              value={buscador}
              ref={buscadorRef}
              onChange={buscar}
              className="form__field"
              type="search"
              placeholder="Buscar..."
              onKeyDown={(e)=>{
                if(e.key==="ArrowDown" && stateListaproductos){
                  e.preventDefault()
                  document.querySelector("[tabindex='0'").focus()
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

// ... Estilos se mantienen igual ...
const Header = styled.div` grid-area: header; display: flex; height: 100%; flex-direction: column; gap: 20px; @media ${Device.desktop} { border-bottom: 1px solid ${({ theme }) => theme.color2}; } .contentprincipal { width: 100%; display: grid; grid-template-areas: "area1 area2" "area3 area3"; .area1 { grid-area: area1; } .area2 { grid-area: area2; } .area3 { grid-area: area3; } @media ${Device.desktop} { display: flex; justify-content: space-between; } .contentlogo { display: flex; align-items: center; font-weight: 700; img { width: 30px; object-fit: contain; } } } .contentbuscador { display: grid; grid-template: "area2 area2" "area1 area1"; gap: 10px; height: 100%; align-items: center; position: relative; .area1 { grid-area: area1; display: flex; gap: 30px; .contentCantidad { width: 150px; } } .area2 { grid-area: area2; display: flex; gap: 10px; } @media ${Device.desktop} { display: flex; justify-content: flex-start; gap: 10px; .area1 { width: 40vw; } } } `;
const ContentSucursal = styled.section` position: absolute; top: 0; left: 0; right: 0; display: flex; justify-content: center; align-items: center; height: 45px; border-bottom: 1px solid ${({ theme }) => theme.color2}; `;
const Contentuser = styled.div` display: flex; align-items: center; gap: 12px; .contentimg { display: flex; align-items: center; width: 40px; height: 40px; border-radius: 50%; overflow: hidden; img { width: 100%; object-fit: cover; } } .textos { display: flex; flex-direction: column; .usuario { font-weight: 700; } } `;