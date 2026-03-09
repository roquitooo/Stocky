import styled from "styled-components";
import { v } from "../../../styles/variables";
import {
  InputText,
  Btn1,
  ConvertirMinusculas,
  useProductosStore,
  ContainerSelector,
  Switch1,
  Selector,
  useSucursalesStore,
  ListaDesplegable,
  useCategoriasStore,
  Btngenerarcodigo,
  useAlmacenesStore,
} from "../../../index";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Device } from "../../../styles/breakpoints";
import { useEffect, useState } from "react";
import { Checkbox1 } from "../Checkbox1";
import Swal from "sweetalert2";
import { toast } from "sonner";

export function RegistrarProductos({
  onClose,
  dataSelect,
  accion,
  setIsExploding,
  esCajero = false,
  state,
}) {
  if (!state) return null;
  const isCajeroEditando = esCajero && accion === "Editar";

  const queryClient = useQueryClient();

  const [isChecked1, setIsChecked1] = useState(true);
  const [isChecked2, setIsChecked2] = useState(false);
  const [sevendepor, setSevendepor] = useState("UNIDAD");

  const handleCheckboxChange = (checkboxNumber) => {
    if (checkboxNumber === 1) {
      setIsChecked1(true);
      setIsChecked2(false);
      setSevendepor("UNIDAD");
    } else {
      setIsChecked1(false);
      setIsChecked2(true);
      setSevendepor("GRAMOS");
    }
  };

  const {
    insertarProductos,
    editarProductos,
    generarCodigo,
    codigogenerado,
    refetchs,
  } = useProductosStore();
  const { dataempresa } = useEmpresaStore();
  const {
    insertarStockAlmacenes,
    mostrarAlmacen,
    dataalmacen,
    eliminarAlmacen,
    editarStock,
  } = useAlmacenesStore();

  const [stateInventarios, setStateInventarios] = useState(false);
  const [stateEnabledStock, setStateEnabledStock] = useState(false);
  const [stateSucursalesLista, setStateSucursalesLista] = useState(false);
  const [stateCategoriasLista, setStateCategoriasLista] = useState(false);
  const [randomCodeinterno, setRandomCodeinterno] = useState("");
  const [randomCodebarras, setRandomCodebarras] = useState("");
  const [categoriaEditadaManualmente, setCategoriaEditadaManualmente] =
    useState(false);

  const { sucursalesItemSelect, dataSucursales, selectSucursal } =
    useSucursalesStore();
  const {
    datacategorias,
    selectCategoria,
    categoriaItemSelect,
    ultimaCategoriaCreadaId,
    limpiarUltimaCategoriaCreada,
  } = useCategoriasStore();

  function obtenerIdCategoriaProducto(producto) {
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
      const normalizado = String(value ?? "").trim();
      if (normalizado) return normalizado;
    }

    return "";
  }

  function obtenerCategoriaProducto(producto, categorias = []) {
    if (!Array.isArray(categorias) || categorias.length === 0) return null;

    const idCategoriaProducto = obtenerIdCategoriaProducto(producto);
    if (idCategoriaProducto) {
      const categoriaPorId = categorias.find(
        (item) => String(item?.id ?? "").trim() === idCategoriaProducto
      );
      if (categoriaPorId) return categoriaPorId;
    }

    const nombreCategoriaProducto = [
      producto?.categoria,
      producto?.nombre_categoria,
      producto?.categoria_nombre,
      producto?.categorias?.nombre,
    ].find((value) => typeof value === "string" && value.trim() !== "");

    if (!nombreCategoriaProducto) return null;

    const nombreNormalizado = nombreCategoriaProducto.trim().toLowerCase();
    return (
      categorias.find(
        (item) =>
          String(item?.nombre ?? "").trim().toLowerCase() === nombreNormalizado
      ) || null
    );
  }

  function normalizarEntero(valor) {
    const texto = String(valor ?? "").trim().replace(",", ".");
    if (texto === "") return 0;
    const numero = Number(texto);
    if (!Number.isFinite(numero)) return 0;
    return Math.trunc(numero);
  }

  function onSelectCategoria(categoria) {
    setCategoriaEditadaManualmente(true);
    selectCategoria(categoria);
  }

  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue, // <--- 1. IMPORTANTE: Necesitamos setValue
    reset, // <--- Para limpiar si es necesario
  } = useForm();

  // Consulta para traer el stock
  const {
    isFetching: isLoadingStock,
    refetch, // <--- ESTO FALTABA
  } = useQuery({
    queryKey: [
      "mostrar stock almacen x sucursal",
      { id_producto: dataSelect?.id, id_sucursal: sucursalesItemSelect?.id },
    ],
    queryFn: () =>
      mostrarAlmacen({
        id_sucursal: sucursalesItemSelect.id,
        id_producto: dataSelect.id,
      }),
    enabled: !!sucursalesItemSelect?.id && !!dataSelect?.id && stateInventarios,
    refetchOnWindowFocus: false,
  });

  // --- 2. SOLUCIÃ“N DEL BUG: Sincronizar inputs cuando llega la data del almacÃ©n ---
  useEffect(() => {
    if (accion === "Editar" && stateInventarios) {
        // Si hay data, la ponemos. Si no, asumimos 0 para evitar undefined
        setValue("stock", normalizarEntero(dataalmacen?.stock));
        setValue("stock_minimo", normalizarEntero(dataalmacen?.stock_minimo));
    }
  }, [dataalmacen, stateInventarios, accion, setValue]);

  // --- Limpieza al cambiar de producto seleccionado ---
  useEffect(()=> {
      if(accion === "Editar") {
         // Opcional: Poner a 0 visualmente mientras carga para no ver el dato anterior
         setValue("stock", 0); 
         setValue("stock_minimo", 0);
      }
  }, [dataSelect.id])

  useEffect(() => {
    setCategoriaEditadaManualmente(false);
  }, [accion, dataSelect?.id]);

  useEffect(() => {
    if (accion !== "Editar" || categoriaEditadaManualmente) return;

    const categoriaDelProducto = obtenerCategoriaProducto(
      dataSelect,
      datacategorias
    );

    if (categoriaDelProducto) {
      selectCategoria(categoriaDelProducto);
    }
  }, [
    accion,
    categoriaEditadaManualmente,
    dataSelect,
    datacategorias,
    selectCategoria,
  ]);

  useEffect(() => {
    if (accion !== "Nuevo" || !ultimaCategoriaCreadaId) return;
    if (!Array.isArray(datacategorias) || datacategorias.length === 0) return;

    const categoriaNueva = datacategorias.find(
      (item) =>
        String(item?.id ?? "").trim() ===
        String(ultimaCategoriaCreadaId ?? "").trim()
    );

    if (categoriaNueva) {
      selectCategoria(categoriaNueva);
    }

    limpiarUltimaCategoriaCreada();
  }, [
    accion,
    datacategorias,
    ultimaCategoriaCreadaId,
    selectCategoria,
    limpiarUltimaCategoriaCreada,
  ]);


  const { isPending, mutate: doInsertar } = useMutation({
    mutationFn: insertar,
    mutationKey: "insertar producto", // corregido key
    onError: (err) => toast.error("Error: " + err.message),
    onSuccess: () => {
      queryClient.invalidateQueries(["mostrar stock almacen x sucursal"]);
      if (refetchs) refetchs();
      toast.success("Producto guardado correctamente");
      cerrarFormulario();
    },
  });

  const handlesub = (data) => {
    doInsertar(data);
  };

  const cerrarFormulario = () => {
    onClose();
    setIsExploding(true);
  };

  async function insertar(data) {
    if (!dataempresa?.id) {
      console.error("Falta ID empresa");
      return;
    }
    validarVacios(data);

    if (accion === "Editar") {
      const categoriaProducto = obtenerCategoriaProducto(
        dataSelect,
        datacategorias
      );
      const idCategoriaProducto =
        categoriaProducto?.id ?? obtenerIdCategoriaProducto(dataSelect);
      const idCategoriaEdicion = categoriaEditadaManualmente
        ? categoriaItemSelect?.id ?? idCategoriaProducto
        : idCategoriaProducto || categoriaItemSelect?.id;

      const p = {
        _id: dataSelect.id,
        _nombre: ConvertirMinusculas(data.nombre),
        _precio_venta: isCajeroEditando
          ? Number(dataSelect?.precio_venta ?? 0)
          : parseFloat(data.precio_venta),
        _precio_compra: isCajeroEditando
          ? Number(dataSelect?.precio_compra ?? 0)
          : parseFloat(data.precio_compra),
        _id_categoria: idCategoriaEdicion,
        _codigo_barras: isCajeroEditando
          ? dataSelect?.codigo_barras
          : randomCodebarras ? randomCodebarras : codigogenerado,
        _codigo_interno: isCajeroEditando
          ? dataSelect?.codigo_interno
          : randomCodeinterno ? randomCodeinterno : codigogenerado,
        _id_empresa: dataempresa.id,
        _sevende_por: isCajeroEditando ? dataSelect?.sevende_por : sevendepor,
        _maneja_inventarios: isCajeroEditando
          ? Boolean(dataSelect?.maneja_inventarios)
          : stateInventarios,
      };
      await editarProductos(p);

      if (stateInventarios) {
        const stock = normalizarEntero(data.stock);
        const stockMinimo = normalizarEntero(data.stock_minimo);
        // Validamos si existe dataalmacen (si ya tenÃ­a registro previo en BD)
        if (dataalmacen?.id) {
             const palmacenes = {
            _id: dataalmacen.id,
            _stock: stock,
            _stock_minimo: stockMinimo,
          };
          await editarStock(palmacenes);
        } else {
            // Si activÃ³ inventario por primera vez en un producto existente
           const palmacenes = {
            id_sucursal: sucursalesItemSelect.id,
            id_producto: dataSelect.id,
            stock: stock,
            stock_minimo: stockMinimo,
          };
          await insertarStockAlmacenes(palmacenes);
        }
      }
    } else {
        // ... Logica de insertar nuevo (sin cambios mayores) ...
      const p = {
        _nombre: ConvertirMinusculas(data.nombre),
        _precio_venta: parseFloat(data.precio_venta),
        _precio_compra: esCajero ? 0 : parseFloat(data.precio_compra),
        _id_categoria: categoriaItemSelect.id,
        _codigo_barras: randomCodebarras ? randomCodebarras : codigogenerado,
        _codigo_interno: randomCodeinterno ? randomCodeinterno : codigogenerado,
        _id_empresa: dataempresa.id,
        _sevende_por: sevendepor,
        _maneja_inventarios: stateInventarios,
        _maneja_multiprecios: false,
      };

      const id_producto_nuevo = await insertarProductos(p);
      if (stateInventarios) {
        const stock = normalizarEntero(data.stock);
        const stockMinimo = normalizarEntero(data.stock_minimo);
        const palmacenes = {
          id_sucursal: sucursalesItemSelect.id,
          id_producto: id_producto_nuevo,
          stock: stock,
          stock_minimo: stockMinimo,
        };
        await insertarStockAlmacenes(palmacenes);
      }
    }
  }

  function checkUseInventarios() {
    if (isCajeroEditando) return;
    if (accion === "Editar") {
      if (dataalmacen) {
        if (stateInventarios) {
          Swal.fire({
            title: "¿Estás seguro(a)?",
            text: "Si desactiva esta opción, se eliminará el stock.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
          }).then(async (result) => {
            if (result.isConfirmed) {
              setStateInventarios(false);
              await eliminarAlmacen({ id: dataalmacen.id });
              // Limpiamos los inputs visualmente
              setValue("stock", 0);
              setValue("stock_minimo", 0);
            }
          });
        } else {
          setStateInventarios(true);
        }
      } else {
        setStateInventarios(!stateInventarios);
      }
    } else {
      setStateInventarios(!stateInventarios);
    }
  }

  function validarVacios(data) {
    if (!randomCodeinterno) generarCodigoInterno();
    if (!randomCodebarras) generarCodigoBarras();
    if (data.precio_venta.toString().trim() === "") data.precio_venta = 0;
    if (!esCajero && data.precio_compra?.toString().trim() === "") data.precio_compra = 0;
    if (stateInventarios) {
      data.stock = normalizarEntero(data.stock);
      data.stock_minimo = normalizarEntero(data.stock_minimo);
    }
  }

  function generarCodigoBarras() {
    generarCodigo();
    setRandomCodebarras(codigogenerado);
  }
  function generarCodigoInterno() {
    generarCodigo();
    setRandomCodeinterno(codigogenerado);
  }
  const handleChangeinterno = (event) =>
    setRandomCodeinterno(event.target.value);
  const handleChangebarras = (event) => setRandomCodebarras(event.target.value);

  useEffect(() => {
    if (accion != "Editar") {
      generarCodigoInterno();
    } else {
      setRandomCodeinterno(dataSelect.codigo_interno);
      setRandomCodebarras(dataSelect.codigo_barras);
      dataSelect.sevende_por === "UNIDAD"
        ? handleCheckboxChange(1)
        : handleCheckboxChange(0);
      dataSelect.maneja_inventarios
        ? setStateInventarios(true)
        : setStateInventarios(false);
      dataSelect.maneja_inventarios
        ? setStateEnabledStock(true)
        : setStateEnabledStock(false);
        
        // Inicializar valores de react-hook-form con lo que viene del producto base
        setValue("nombre", dataSelect.nombre);
        setValue("precio_venta", dataSelect.precio_venta);
        setValue("precio_compra", dataSelect.precio_compra);
    }
  }, [accion, dataSelect, esCajero, setValue]);

  return (
    <Container>
      {isPending ? (
        <span>Cargando...</span>
      ) : (
        <div className="sub-contenedor">
          <div className="headers">
            <section>
              <h1>
                {accion == "Editar"
                  ? "Editar producto"
                  : "REGISTRAR NUEVO PRODUCTO"}
              </h1>
            </section>
            <section>
              <span
                onClick={() => {
                  if (refetchs) refetchs();
                  onClose();
                }}
              >
                x
              </span>
            </section>
          </div>

          <form className="formulario" onSubmit={handleSubmit(handlesub)}>
            <section className="seccion1">
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    className="form__field"
                    // defaultValue quitado, controlado por useEffect/setValue
                    type="text"
                    placeholder="nombre"
                    {...register("nombre", { required: true })}
                  />
                  <label className="form__label">Nombre</label>
                  {errors.nombre?.type === "required" && <p>Campo requerido</p>}
                </InputText>
              </article>
              <article>
                <InputText icono={<v.iconoflechaderecha />}>
                  <input
                    step="0.01"
                    className="form__field"
                    // defaultValue quitado
                    type="number"
                    placeholder="precio de venta"
                    disabled={isCajeroEditando}
                    {...register("precio_venta")}
                  />
                  <label className="form__label">Precio venta</label>
                </InputText>
              </article>
              {!esCajero && (
                <article>
                  <InputText icono={<v.iconoflechaderecha />}>
                    <input
                      step="0.01"
                      className="form__field"
                      type="number"
                      placeholder="precio de compra"
                      disabled={isCajeroEditando}
                      {...register("precio_compra")}
                    />
                    <label className="form__label">Precio compra</label>
                  </InputText>
                </article>
              )}
             
              {/* ... (SECCION DE CODIGOS DE BARRAS IGUAL) ... */}
               <article className="contentPadregenerar">
                <InputText icono={<v.iconoflechaderecha />}>
                  <input className="form__field" value={randomCodebarras} onChange={handleChangebarras} type="text" placeholder="código de barras" disabled={isCajeroEditando} />
                  <label className="form__label">Código de barras</label>
                </InputText>
                {!isCajeroEditando && (
                  <ContainerBtngenerar><Btngenerarcodigo titulo="Generar" funcion={generarCodigoBarras} /></ContainerBtngenerar>
                )}
              </article>
              <article className="contentPadregenerar">
                <InputText icono={<v.iconoflechaderecha />}>
                  <input className="form__field" value={randomCodeinterno} onChange={handleChangeinterno} type="text" placeholder="código interno" disabled={isCajeroEditando} />
                  <label className="form__label">Código interno</label>
                </InputText>
                {!isCajeroEditando && (
                  <ContainerBtngenerar><Btngenerarcodigo titulo="Generar" funcion={generarCodigoInterno} /></ContainerBtngenerar>
                )}
              </article>

            </section>

            <section className="seccion2">
              <label>Se vende por: </label>
              <ContainerSelector>
                <label>UNIDAD </label>{" "}
                <Checkbox1
                  isChecked={isChecked1}
                  onChange={() => !isCajeroEditando && handleCheckboxChange(1)}
                />
                <label>Gramos</label>{" "}
                <Checkbox1
                  isChecked={isChecked2}
                  onChange={() => !isCajeroEditando && handleCheckboxChange(2)}
                />
              </ContainerSelector>

              <ContainerSelector>
                <label>Categoría: </label>
                <Selector
                  state={stateCategoriasLista}
                  funcion={() => setStateCategoriasLista(!stateCategoriasLista)}
                  texto1={"\u{1F3EC}"}
                  texto2={categoriaItemSelect?.nombre}
                  color="#ffbd58"
                />
                <ListaDesplegable
                  funcion={onSelectCategoria}
                  state={stateCategoriasLista}
                  data={datacategorias}
                  top="4rem"
                  setState={() => setStateCategoriasLista(!stateCategoriasLista)}
                />
              </ContainerSelector>

              <ContainerSelector>
                <label>Controlar stock: </label>
                <Switch1
                  state={stateInventarios}
                  setState={isCajeroEditando ? () => {} : checkUseInventarios}
                />
              </ContainerSelector>

              {stateInventarios && (
                <ContainerStock>
                  <ContainerSelector>
                    <label>Sucursal: </label>
                    <Selector
                      state={stateSucursalesLista}
                      funcion={() =>
                        !isCajeroEditando &&
                        setStateSucursalesLista(!stateSucursalesLista)
                      }
                      texto1={"\u{1F3EC}"}
                      texto2={sucursalesItemSelect?.nombre}
                      color="#ffbd58"
                    />
                    <ListaDesplegable
                      refetch={refetch}
                      funcion={isCajeroEditando ? () => {} : selectSucursal}
                      state={stateSucursalesLista}
                      data={dataSucursales}
                      top="4rem"
                      setState={() =>
                        !isCajeroEditando &&
                        setStateSucursalesLista(!stateSucursalesLista)
                      }
                    />
                  </ContainerSelector>
                  
                  {/* AQUÃ ESTÃ LA MAGIA VISUAL: Si estÃ¡ cargando, mostramos loading */}
                  {isLoadingStock ? (
                    <span style={{padding:"10px"}}>Cargando stock...</span>
                  ) : (
                    <>
                      <article>
                        <InputText icono={<v.iconoflechaderecha />}>
                          <input
                            className="form__field"
                            // defaultValue ELIMINADO: Controlado por setValue en useEffect
                            step="1"
                            inputMode="numeric"
                            type="number"
                            placeholder="stock"
                            {...register("stock", { setValueAs: normalizarEntero })}
                          />
                          <label className="form__label">Stock Actual:</label>
                        </InputText>
                      </article>
                      <article>
                        <InputText icono={<v.iconoflechaderecha />}>
                          <input
                            className="form__field"
                             // defaultValue ELIMINADO
                            step="1"
                            inputMode="numeric"
                            type="number"
                            placeholder="stock mínimo"
                            {...register("stock_minimo", { setValueAs: normalizarEntero })}
                          />
                          <label className="form__label">Alerta de stock crítico:</label>
                        </InputText>
                      </article>
                    </>
                  )}
                </ContainerStock>
              )}
            </section>

            <Btn1
              icono={<v.iconoguardar />}
              titulo="Guardar"
              bgcolor="#Ffdb58"
            />
          </form>
        </div>
      )}
    </Container>
  );
}

const Container = styled.div` transition: 0.5s; top: 0; left: 0; position: fixed; background-color: rgba(10, 9, 9, 0.5); display: flex; width: 100%; min-height: 100vh; align-items: center; justify-content: center; z-index: 1000; .sub-contenedor { position: relative; width: 100%; background: ${({ theme }) => theme.bgtotal}; box-shadow: -10px 15px 30px rgba(10, 9, 9, 0.4); padding: 13px 36px 13px 36px; z-index: 100; height: calc(100vh - 20px); overflow-y: auto; .headers { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; h1 { font-size: 20px; font-weight: 500; } span { font-size: 20px; cursor: pointer; } } .formulario { display: grid; grid-template-columns: 1fr; gap: 15px; @media ${Device.tablet} { grid-template-columns: repeat(2, 1fr); } .seccion1, .seccion2 { gap: 20px; display: flex; flex-direction: column; } .contentPadregenerar { position: relative; } } } `;

const ContainerStock = styled.div` 
  display: flex; 
  border-radius: 15px; 
  padding: 12px; 
  flex-direction: column; 
  border: 1px solid ${({ theme }) => theme.color2}; 
`;

const ContainerBtngenerar = styled.div` position: absolute; right: 0; top: 10%; `;


