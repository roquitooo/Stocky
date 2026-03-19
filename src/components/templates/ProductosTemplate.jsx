import styled from "styled-components";
import {
  Btn1,
  Buscador,
  RegistrarProductos,
  TablaProductos,
  Title,
  useCategoriasStore,
  useEmpresaStore,
  useProductosStore,
  useSucursalesStore,
  useUsuariosStore,
  supabase,
} from "../../index";
import { v } from "../../styles/variables";
import { useEffect, useMemo, useRef, useState } from "react";
import { AumentarPrecio } from "../organismos/formularios/AumentarPrecio";
import { BarLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PropTypes from "prop-types";

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

function normalizarHeaderCsv(valor) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function detectarDelimitadorCsv(lineaCabecera = "") {
  const linea = String(lineaCabecera || "");
  const countPuntoComa = (linea.match(/;/g) || []).length;
  const countComa = (linea.match(/,/g) || []).length;
  return countPuntoComa > countComa ? ";" : ",";
}

function parsearLineaCsv(linea = "", delimitador = ",") {
  const resultado = [];
  let actual = "";
  let enComillas = false;

  for (let i = 0; i < linea.length; i += 1) {
    const char = linea[i];
    const siguiente = linea[i + 1];

    if (char === '"') {
      if (enComillas && siguiente === '"') {
        actual += '"';
        i += 1;
      } else {
        enComillas = !enComillas;
      }
      continue;
    }

    if (char === delimitador && !enComillas) {
      resultado.push(actual.trim());
      actual = "";
      continue;
    }

    actual += char;
  }

  resultado.push(actual.trim());
  return resultado;
}

function parsearArchivoCsv(texto = "") {
  const contenido = String(texto || "").replace(/\uFEFF/g, "");
  const lineas = contenido
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);

  if (lineas.length < 2) {
    return { delimitador: ",", encabezados: [], filas: [] };
  }

  const delimitador = detectarDelimitadorCsv(lineas[0]);
  const encabezadosRaw = parsearLineaCsv(lineas[0], delimitador);
  const encabezados = encabezadosRaw.map(normalizarHeaderCsv);

  const filas = lineas.slice(1).map((linea, index) => {
    const columnas = parsearLineaCsv(linea, delimitador);
    const row = {};
    encabezados.forEach((key, colIndex) => {
      row[key] = String(columnas[colIndex] ?? "").trim();
    });
    return {
      rowNumber: index + 2,
      raw: row,
    };
  });

  return { delimitador, encabezados, filas };
}

function obtenerValorCsv(raw = {}, claves = []) {
  for (const clave of claves) {
    const normalizada = normalizarHeaderCsv(clave);
    const valor = raw?.[normalizada];
    if (valor !== undefined && String(valor).trim() !== "") {
      return String(valor).trim();
    }
  }
  return "";
}

function parsearNumeroCsv(valor) {
  const original = String(valor ?? "").trim();
  if (!original) return null;

  let limpio = original.replace(/\s/g, "");

  if (limpio.includes(",") && limpio.includes(".")) {
    if (limpio.lastIndexOf(",") > limpio.lastIndexOf(".")) {
      limpio = limpio.replace(/\./g, "").replace(",", ".");
    } else {
      limpio = limpio.replace(/,/g, "");
    }
  } else {
    limpio = limpio.replace(",", ".");
  }

  const numero = Number(limpio);
  return Number.isFinite(numero) ? numero : null;
}

function parsearBooleanCsv(valor) {
  const key = String(valor || "").trim().toLowerCase();
  if (!key) return false;
  return ["1", "true", "si", "sí", "yes", "y", "x", "on"].includes(key);
}

function escaparValorCsv(valor) {
  const texto = String(valor ?? "");
  if (texto.includes('"') || texto.includes(";") || texto.includes("\n")) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

function normalizarSeVendePorCsv(valor) {
  const key = String(valor || "").trim().toLowerCase();
  if (!key) return "UNIDAD";
  if (key.includes("gram")) return "GRAMOS";
  return "UNIDAD";
}

function obtenerNombreCategoriaProducto(producto, categorias = []) {
  if (!producto || typeof producto !== "object") return "";

  const posiblesNombres = [
    producto.categoria,
    producto.nombre_categoria,
    producto.categoria_nombre,
    producto?.categoria?.nombre,
    producto?.categorias?.nombre,
  ];

  for (const value of posiblesNombres) {
    const nombre = String(value ?? "").trim();
    if (nombre) return nombre;
  }

  const idCategoria = obtenerIdCategoriaProducto(producto);
  if (!idCategoria || !Array.isArray(categorias)) return "";

  const categoria = categorias.find(
    (item) => String(item?.id ?? "").trim() === String(idCategoria)
  );
  return String(categoria?.nombre ?? "").trim();
}

function obtenerStockProducto(producto) {
  const stock = Number(
    producto?.stock ?? producto?._stock ?? producto?.cantidad_stock ?? 0
  );
  return Number.isFinite(stock) ? Math.trunc(stock) : 0;
}

function obtenerStockMinimoProducto(producto) {
  const stockMinimo = Number(
    producto?.stock_minimo ??
      producto?._stock_minimo ??
      producto?.stockminimo ??
      producto?.cantidad_stock_minimo ??
      0
  );
  return Number.isFinite(stockMinimo) ? Math.trunc(stockMinimo) : 0;
}

function generarCodigoAleatorio(sufijo = "") {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let prefijo = "";
  for (let i = 0; i < 4; i += 1) {
    prefijo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefijo}${String(sufijo || "").slice(-6)}369`;
}

function validarFilaPreviewCsv(fila, { idSucursalActiva }) {
  const errors = [];

  const nombre = String(fila?.nombre || "").trim();
  const precioVentaNumero = parsearNumeroCsv(fila?.precioVenta);
  const stockNumero = parsearNumeroCsv(fila?.stock);
  const stockMinimoNumero = parsearNumeroCsv(fila?.stockMinimo);
  const manejaInventarios = Boolean(fila?.manejaInventarios);

  if (!nombre) errors.push("Falta nombre");
  if (!Number.isFinite(precioVentaNumero) || precioVentaNumero < 0) {
    errors.push("Precio venta inválido");
  }
  if (!String(fila?.idCategoria || "").trim()) {
    errors.push("Categoría no encontrada");
  }

  if (manejaInventarios && !idSucursalActiva) {
    errors.push("No hay sucursal activa para cargar stock");
  }
  if (manejaInventarios && (!Number.isFinite(stockNumero) || stockNumero < 0)) {
    errors.push("Stock inválido");
  }
  if (
    manejaInventarios &&
    (!Number.isFinite(stockMinimoNumero) || stockMinimoNumero < 0)
  ) {
    errors.push("Stock mínimo inválido");
  }

  return {
    ...fila,
    errors,
  };
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
  const { dataempresa } = useEmpresaStore();
  const { sucursalesItemSelect } = useSucursalesStore();
  const { dataProductos, setBuscador, generarCodigo, mostrarProductos, parametros } =
    useProductosStore();
  const { datacategorias } = useCategoriasStore();
  const [accion, setAccion] = useState("");
  const [dataSelect, setdataSelect] = useState([]);
  const [, setIsExploding] = useState(false);
  const [openCategoriasFiltro, setOpenCategoriasFiltro] = useState(false);
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] = useState([]);
  const filtroCategoriasRef = useRef(null);
  const [rowSelection, setRowSelection] = useState({});
  const [openAumento, setOpenAumento] = useState(false);
  const [csvPreviewOpen, setCsvPreviewOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvRowsPreview, setCsvRowsPreview] = useState([]);
  const [csvDelimitador, setCsvDelimitador] = useState(",");
  const [csvProcesando, setCsvProcesando] = useState(false);
  const [csvImportando, setCsvImportando] = useState(false);
  const [csvExportando, setCsvExportando] = useState(false);
  const csvInputRef = useRef(null);
  const selectedIds = Object.keys(rowSelection).map((key) => parseInt(key, 10));
  const filtroBajoStock =
    new URLSearchParams(location.search).get("filtro") === "bajo-stock";
  const esCajero = String(datausuarios?.roles?.nombre || "")
    .toLowerCase()
    .includes("cajero");
  const sucursalActiva = Array.isArray(sucursalesItemSelect)
    ? sucursalesItemSelect[0]
    : sucursalesItemSelect;
  const idSucursalActiva = sucursalActiva?.id ?? sucursalActiva?.id_sucursal ?? null;

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

  const csvRowsValidas = useMemo(
    () => csvRowsPreview.filter((row) => row.errors.length === 0),
    [csvRowsPreview]
  );
  const csvRowsConErrores = useMemo(
    () => csvRowsPreview.filter((row) => row.errors.length > 0),
    [csvRowsPreview]
  );

  function abrirImportadorCsv() {
    if (csvInputRef.current) {
      csvInputRef.current.value = "";
      csvInputRef.current.click();
    }
  }

  async function onSelectCsvFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvProcesando(true);
    setCsvFileName(file.name);
    try {
      const texto = await file.text();
      const { delimitador, filas } = parsearArchivoCsv(texto);

      if (!filas.length) {
        toast.warning("El CSV no tiene filas para importar.");
        setCsvRowsPreview([]);
        setCsvPreviewOpen(false);
        return;
      }

      const categoriasById = new Set(
        (categoriasDisponibles || []).map((cat) => String(cat.id))
      );

      const preview = filas.map((fila) => {
        const raw = fila.raw;

        const nombre = obtenerValorCsv(raw, ["nombre", "producto", "descripcion"]);
        const precioVentaRaw = obtenerValorCsv(raw, [
          "precio_venta",
          "precio venta",
          "precio",
        ]);
        const precioCompraRaw = obtenerValorCsv(raw, [
          "precio_compra",
          "precio compra",
          "costo",
        ]);
        const categoriaRaw = obtenerValorCsv(raw, [
          "id_categoria",
          "categoria_id",
          "categoria",
          "rubro",
        ]);
        const sevendePorRaw = obtenerValorCsv(raw, ["sevende_por", "unidad_medida"]);
        const manejaInventariosRaw = obtenerValorCsv(raw, [
          "maneja_inventarios",
          "controlar_stock",
          "stock_activo",
        ]);
        const stockRaw = obtenerValorCsv(raw, ["stock", "stock_inicial"]);
        const stockMinimoRaw = obtenerValorCsv(raw, ["stock_minimo", "stock_min"]);
        const codigoBarrasRaw = obtenerValorCsv(raw, [
          "codigo_barras",
          "codigo_de_barras",
          "codigo barras",
          "codigo de barras",
          "cod_barras",
          "barcode",
          "ean",
          "gtin",
        ]);
        const codigoInternoRaw = obtenerValorCsv(raw, [
          "codigo_interno",
          "codigo interno",
          "cod_interno",
          "sku",
        ]);

        const precioVenta = parsearNumeroCsv(precioVentaRaw);
        const precioCompra = parsearNumeroCsv(precioCompraRaw);
        const manejaInventarios = parsearBooleanCsv(manejaInventariosRaw);
        const stockNumero = parsearNumeroCsv(stockRaw);
        const stockMinimoNumero = parsearNumeroCsv(stockMinimoRaw);

        let idCategoria = "";
        if (categoriaRaw) {
          const categoriaAsId = String(categoriaRaw).trim();
          if (categoriasById.has(categoriaAsId)) {
            idCategoria = categoriaAsId;
          } else {
            idCategoria = categoriasPorNombre.get(categoriaAsId.toLowerCase()) || "";
          }
        }

        return validarFilaPreviewCsv({
          rowNumber: fila.rowNumber,
          nombre: nombre || "",
          precioVenta: Number.isFinite(precioVenta) ? Number(precioVenta) : "",
          precioCompra: Number.isFinite(precioCompra) ? Number(precioCompra) : 0,
          idCategoria,
          categoriaRaw: categoriaRaw || "",
          sevendePor: normalizarSeVendePorCsv(sevendePorRaw),
          manejaInventarios,
          stock: manejaInventarios
            ? (Number.isFinite(stockNumero) ? Math.trunc(stockNumero) : "")
            : 0,
          stockMinimo: manejaInventarios
            ? (Number.isFinite(stockMinimoNumero) ? Math.trunc(stockMinimoNumero) : 0)
            : 0,
          codigoBarras: codigoBarrasRaw,
          codigoInterno: codigoInternoRaw,
        }, { idSucursalActiva });
      });

      setCsvRowsPreview(preview);
      setCsvDelimitador(delimitador);
      setCsvPreviewOpen(true);
    } catch (error) {
      toast.error(`No se pudo leer el archivo CSV. ${error?.message || ""}`);
      setCsvRowsPreview([]);
      setCsvPreviewOpen(false);
    } finally {
      setCsvProcesando(false);
    }
  }

  function editarCampoPreviewCsv(rowNumber, field, value) {
    setCsvRowsPreview((prev) =>
      prev.map((row) => {
        if (row.rowNumber !== rowNumber) return row;

        let nextValue = value;
        if (field === "stock") {
          if (value === "") {
            nextValue = "";
          } else {
            const parsed = Number(value);
            nextValue = Number.isFinite(parsed) ? Math.trunc(Math.max(0, parsed)) : "";
          }
        }

        if (field === "precioVenta") {
          if (value === "") {
            nextValue = "";
          } else {
            const parsed = parsearNumeroCsv(value);
            nextValue = Number.isFinite(parsed) ? parsed : value;
          }
        }

        if (field === "precioCompra") {
          if (value === "") {
            nextValue = "";
          } else {
            const parsed = parsearNumeroCsv(value);
            nextValue = Number.isFinite(parsed) ? parsed : value;
          }
        }

        if (field === "codigoBarras" || field === "codigoInterno") {
          nextValue = String(value || "").trim();
        }

        const filaEditada = {
          ...row,
          [field]: nextValue,
        };

        return validarFilaPreviewCsv(filaEditada, { idSucursalActiva });
      })
    );
  }

  async function confirmarCargaCsv() {
    if (!dataempresa?.id) {
      toast.error("No se detectó la empresa activa.");
      return;
    }

    if (csvRowsValidas.length === 0) {
      toast.warning("No hay filas válidas para importar.");
      return;
    }

    setCsvImportando(true);
    let ok = 0;
    let fail = 0;

    for (let i = 0; i < csvRowsValidas.length; i += 1) {
      const item = csvRowsValidas[i];
      const codigoBase = String(Date.now() + i);
      const payloadProducto = {
        _nombre: String(item.nombre || "").trim().toLowerCase(),
        _precio_venta: Number(item.precioVenta || 0),
        _precio_compra: Number(item.precioCompra || 0),
        _id_categoria: item.idCategoria,
        _codigo_barras: item.codigoBarras || generarCodigoAleatorio(codigoBase),
        _codigo_interno: item.codigoInterno || generarCodigoAleatorio(`${codigoBase}i`),
        _id_empresa: dataempresa.id,
        _sevende_por: item.sevendePor,
        _maneja_inventarios: item.manejaInventarios,
        _maneja_multiprecios: false,
      };

      try {
        const { data: idProductoNuevo, error: productoError } = await supabase.rpc(
          "insertarproductos",
          payloadProducto
        );
        if (productoError) throw productoError;

        const idProducto = Number(idProductoNuevo);
        if (!Number.isFinite(idProducto) || idProducto <= 0) {
          throw new Error("No se pudo obtener el ID del producto insertado.");
        }

        if (item.manejaInventarios) {
          const { error: stockError } = await supabase.from("almacenes").insert({
            id_sucursal: idSucursalActiva,
            id_producto: idProducto,
            stock: Math.trunc(Number(item.stock || 0)),
            stock_minimo: Math.trunc(Number(item.stockMinimo || 0)),
          });
          if (stockError) throw stockError;
        }

        ok += 1;
      } catch (error) {
        fail += 1;
        console.error(`Error importando fila ${item.rowNumber}:`, error);
      }
    }

    if (parametros?.id_empresa) {
      await mostrarProductos(parametros);
    }

    setCsvImportando(false);
    setCsvPreviewOpen(false);
    setCsvRowsPreview([]);

    if (ok > 0 && fail === 0) {
      toast.success(`Importación completada: ${ok} producto(s) cargado(s).`);
    } else if (ok > 0 && fail > 0) {
      toast.warning(`Importación parcial: ${ok} cargados, ${fail} con error.`);
    } else {
      toast.error("No se pudo cargar ningún producto.");
    }
  }

  async function exportarProductosCsv() {
    if (!dataempresa?.id) {
      toast.error("No se detectó la empresa activa.");
      return;
    }

    setCsvExportando(true);
    try {
      const payloadSeguro = {
        _id_empresa: dataempresa.id,
        _id_sucursal: idSucursalActiva || 0,
      };
      const seguro = await supabase.rpc("mostrarproductos_seguro", payloadSeguro);

      let productos = [];
      if (!seguro.error) {
        productos = Array.isArray(seguro.data) ? seguro.data : [];
      } else {
        const mensaje = String(seguro.error?.message || "").toLowerCase();
        const esFallbackValido =
          seguro.error?.code === "42883" ||
          mensaje.includes("function") ||
          mensaje.includes("no existe");

        if (!esFallbackValido) throw seguro.error;

        const fallback = await supabase.rpc("mostrarproductos", {
          _id_empresa: dataempresa.id,
        });
        if (fallback.error) throw fallback.error;
        productos = Array.isArray(fallback.data) ? fallback.data : [];
      }

      if (!productos.length) {
        toast.warning("No hay productos para exportar.");
        return;
      }

      const headers = [
        "nombre",
        "precio_venta",
        "precio_compra",
        "categoria",
        "sevende_por",
        "maneja_inventarios",
        "stock",
        "stock_minimo",
        "codigo_barras",
        "codigo_interno",
      ];

      const filas = productos.map((producto) => {
        const nombre = String(
          producto?.nombre ?? producto?._descripcion ?? producto?.descripcion ?? ""
        ).trim();
        const categoria = obtenerNombreCategoriaProducto(
          producto,
          categoriasDisponibles
        );
        const sevendePor = normalizarSeVendePorCsv(producto?.sevende_por);
        const manejaInventarios =
          producto?.maneja_inventarios === true ||
          String(producto?.maneja_inventarios).toLowerCase() === "true";

        return [
          nombre,
          Number(producto?.p_venta ?? producto?.precio_venta ?? 0),
          Number(producto?.p_compra ?? producto?.precio_compra ?? 0),
          categoria,
          sevendePor,
          manejaInventarios ? "true" : "false",
          manejaInventarios ? obtenerStockProducto(producto) : 0,
          manejaInventarios ? obtenerStockMinimoProducto(producto) : 0,
          String(producto?.codigo_barras ?? "").trim(),
          String(producto?.codigo_interno ?? "").trim(),
        ]
          .map((valor) => escaparValorCsv(valor))
          .join(";");
      });

      const contenidoCsv = `\uFEFF${headers.join(";")}\r\n${filas.join("\r\n")}`;
      const blob = new Blob([contenidoCsv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fecha = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `productos-export-${fecha}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`CSV exportado: ${productos.length} producto(s).`);
    } catch (error) {
      toast.error(`No se pudo exportar el CSV. ${error?.message || ""}`);
    } finally {
      setCsvExportando(false);
    }
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

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: "none" }}
        onChange={onSelectCsvFile}
      />

      {csvPreviewOpen && (
        <div className="csv-overlay">
          <div className="csv-modal">
            <div className="csv-header">
              <h3>Vista previa CSV</h3>
              <button
                type="button"
                className="csv-close"
                onClick={() => setCsvPreviewOpen(false)}
                disabled={csvImportando}
              >
                x
              </button>
            </div>

            <div className="csv-meta">
              <span><strong>Archivo:</strong> {csvFileName || "-"}</span>
              <span><strong>Delimitador:</strong> {csvDelimitador === ";" ? "Punto y coma (;)" : "Coma (,)"}</span>
              <span><strong>Total filas:</strong> {csvRowsPreview.length}</span>
              <span><strong>Válidas:</strong> {csvRowsValidas.length}</span>
              <span><strong>Con error:</strong> {csvRowsConErrores.length}</span>
              <span>
                <strong>Headers código:</strong>{" "}
                codigo_barras / codigo de barras / barcode / ean / gtin
              </span>
            </div>

            <div className="csv-table-wrap">
              <table className="csv-table">
                <thead>
                  <tr>
                    <th>Fila</th>
                    <th>Nombre</th>
                    <th>Codigo barras</th>
                    <th>Codigo interno</th>
                    <th>Precio venta</th>
                    <th>Precio compra</th>
                    <th>Categoría</th>
                    <th>Inventario</th>
                    <th>Stock</th>
                    <th>Stock min.</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {csvRowsPreview.map((item) => (
                    <tr key={`csv-row-${item.rowNumber}`}>
                      <td>{item.rowNumber}</td>
                      <td>{item.nombre || "-"}</td>
                      <td>
                        <input
                          type="text"
                          className="csv-edit-input"
                          value={item.codigoBarras ?? ""}
                          onChange={(e) =>
                            editarCampoPreviewCsv(
                              item.rowNumber,
                              "codigoBarras",
                              e.target.value
                            )
                          }
                          placeholder="Ej: 779..."
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="csv-edit-input"
                          value={item.codigoInterno ?? ""}
                          onChange={(e) =>
                            editarCampoPreviewCsv(
                              item.rowNumber,
                              "codigoInterno",
                              e.target.value
                            )
                          }
                          placeholder="Opcional"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="csv-edit-input"
                          value={item.precioVenta ?? ""}
                          onChange={(e) =>
                            editarCampoPreviewCsv(
                              item.rowNumber,
                              "precioVenta",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="csv-edit-input"
                          value={item.precioCompra ?? ""}
                          onChange={(e) =>
                            editarCampoPreviewCsv(
                              item.rowNumber,
                              "precioCompra",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td>{item.categoriaRaw || "-"}</td>
                      <td>{item.manejaInventarios ? "Sí" : "No"}</td>
                      <td>
                        {item.manejaInventarios ? (
                          <input
                            type="number"
                            min="0"
                            step="1"
                            className="csv-edit-input"
                            value={item.stock ?? ""}
                            onChange={(e) =>
                              editarCampoPreviewCsv(
                                item.rowNumber,
                                "stock",
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{item.manejaInventarios ? item.stockMinimo : "-"}</td>
                      <td className={item.errors.length ? "csv-error" : "csv-ok"}>
                        {item.errors.length ? item.errors.join(" | ") : "OK"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="csv-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setCsvPreviewOpen(false)}
                disabled={csvImportando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={confirmarCargaCsv}
                disabled={csvImportando || csvRowsValidas.length === 0}
              >
                {csvImportando ? "Importando..." : `Cargar válidas (${csvRowsValidas.length})`}
              </button>
            </div>
          </div>
        </div>
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
        <button
          type="button"
          className="btn-csv"
          onClick={abrirImportadorCsv}
          disabled={csvProcesando || csvImportando || csvExportando}
        >
          {csvProcesando ? "Leyendo CSV..." : "Importar CSV"}
        </button>
        <button
          type="button"
          className="btn-csv export"
          onClick={exportarProductosCsv}
          disabled={csvProcesando || csvImportando || csvExportando}
        >
          {csvExportando ? "Exportando CSV..." : "Exportar CSV"}
        </button>
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
          {`Ver stock bajo (${isLoadingLowStock ? "..." : lowStockProductIds.length})`}
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

ProductosTemplate.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  lowStockProductIds: PropTypes.arrayOf(PropTypes.number),
  isLoadingLowStock: PropTypes.bool,
};

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

  .btn-csv {
    border: 1px solid #1f9f58;
    background: linear-gradient(180deg, #34d67b 0%, #1f9f58 100%);
    color: #ffffff;
    font-weight: 700;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    min-height: 40px;
  }

  .btn-csv.export {
    border-color: #f0c933;
    background: linear-gradient(180deg, #ffe88a 0%, #ffdb58 100%);
    color: #4d3b00;
  }

  .btn-csv:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

  .csv-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .csv-modal {
    width: min(1200px, 96vw);
    max-height: calc(100vh - 40px);
    background: ${({ theme }) => theme.bgtotal};
    border: 1px solid ${({ theme }) => theme.color2};
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .csv-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid ${({ theme }) => theme.color2};
  }

  .csv-header h3 {
    margin: 0;
    font-size: 16px;
  }

  .csv-close {
    border: none;
    background: transparent;
    color: ${({ theme }) => theme.text};
    font-size: 22px;
    cursor: pointer;
    line-height: 1;
  }

  .csv-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    padding: 10px 14px;
    border-bottom: 1px solid ${({ theme }) => theme.color2};
    font-size: 12px;
  }

  .csv-table-wrap {
    overflow: auto;
    padding: 8px 14px;
    flex: 1;
  }

  .csv-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1150px;
  }

  .csv-table th,
  .csv-table td {
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    padding: 8px 6px;
    text-align: left;
    font-size: 12px;
    white-space: nowrap;
  }

  .csv-table th {
    font-weight: 700;
  }

  .csv-edit-input {
    width: 100%;
    min-width: 90px;
    border: 1px solid ${({ theme }) => theme.color2};
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    border-radius: 8px;
    padding: 5px 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .csv-ok {
    color: #16a34a;
    font-weight: 700;
  }

  .csv-error {
    color: #dc2626;
    font-weight: 700;
  }

  .csv-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 14px;
    border-top: 1px solid ${({ theme }) => theme.color2};
  }

  .csv-actions .btn-secondary,
  .csv-actions .btn-primary {
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .csv-actions .btn-secondary {
    background: #e5e7eb;
    color: #111827;
  }

  .csv-actions .btn-primary {
    background: linear-gradient(180deg, #34d67b 0%, #1f9f58 100%);
    color: #fff;
  }

  .csv-actions button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
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

    .btn-csv {
      width: 100%;
    }

    .categorias-popover {
      left: 0;
      right: auto;
      width: 100%;
    }
  }
`;
