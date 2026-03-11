import { urlToBase64, FormatearNumeroDinero } from "../utils/Conversiones";
import createPdf from "../utils/CreatePdf";
import logoDefaultStocky from "../assets/logo.svg";

const formatFecha = (value) => {
  const d = new Date(value || Date.now());
  if (Number.isNaN(d.getTime())) return "--";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}:${ss}`;
};

const getNumeroTicket = () => {
  const now = new Date();
  const y = String(now.getFullYear()).slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${y}${m}${d}-${h}${mi}${s}`;
};

const getYear = () => new Date().getFullYear();

const estimarLineas = (texto, charsPorLinea = 26) => {
  const limpio = String(texto || "").trim();
  if (!limpio) return 1;
  return Math.max(1, Math.ceil(limpio.length / charsPorLinea));
};

const estimarAlturaTicket = ({ productos = [], incluyeLogo = false }) => {
  const alturaBase = 370 + (incluyeLogo ? 70 : 0); // Header + metadatos + totales + footer
  const alturaEncabezadoTabla = 24;

  const alturaFilas = productos.reduce((acc, item) => {
    const nombre = item?.nombre || item?._descripcion || "Producto";
    const lineas = estimarLineas(nombre, 26);
    return acc + 18 + (lineas - 1) * 10;
  }, 0);

  // Margen de seguridad para evitar saltos inesperados de pdfmake.
  const total = alturaBase + alturaEncabezadoTabla + alturaFilas + 140;
  return Math.max(560, Math.min(5000, Math.ceil(total)));
};

const crearDivider = () => ({
  canvas: [
    {
      type: "line",
      x1: 0,
      y1: 0,
      x2: 210,
      y2: 0,
      lineWidth: 1,
      dash: { length: 2 },
      lineColor: "#8b8b8b",
    },
  ],
  margin: [0, 6, 0, 6],
});

const esLogoValido = (valor) => {
  if (typeof valor !== "string") return false;
  const limpio = valor.trim();
  return limpio !== "" && limpio !== "-";
};

const esDataUrlImagenCompatiblePdfmake = (valor) => {
  if (typeof valor !== "string") return false;
  return /^data:image\/(png|jpe?g);base64,/i.test(valor.trim());
};

const pareceSvg = (valor) => {
  if (typeof valor !== "string") return false;
  const limpio = valor.trim().toLowerCase();
  return (
    limpio.startsWith("data:image/svg+xml") ||
    limpio.includes(".svg") ||
    limpio.includes("image/svg+xml")
  );
};

const resolverDataUrlCompatible = async (fuente) => {
  if (!esLogoValido(fuente)) return null;

  const valor = String(fuente).trim();
  if (valor.startsWith("data:")) {
    return esDataUrlImagenCompatiblePdfmake(valor) ? valor : null;
  }

  if (pareceSvg(valor)) return null;

  const dataUrl = await urlToBase64(valor);
  return esDataUrlImagenCompatiblePdfmake(dataUrl) ? dataUrl : null;
};

const resolverLogoTicket = async (data) => {
  const candidatoEmpresa = [data?.logo, data?.logo_empresa, data?.empresa?.logo].find(
    esLogoValido
  );
  const fuente = candidatoEmpresa || logoDefaultStocky;

  if (!esLogoValido(fuente)) return null;

  try {
    const candidato = await resolverDataUrlCompatible(fuente);
    if (candidato) return candidato;
  } catch (_) {
    // Ignora errores de conversion del logo principal y prueba fallback.
  }

  if (fuente === logoDefaultStocky) return null;

  try {
    return await resolverDataUrlCompatible(logoDefaultStocky);
  } catch (_) {
    return null;
  }
};

const TicketVenta = async (output, data) => {
  const logoempresa = await resolverLogoTicket(data);
  const productos = Array.isArray(data?.productos)
    ? data.productos.map((item) => ({ ...item }))
    : [];
  const subtotal = Number(data?.subtotal || 0);
  const total = Number(data?.total || 0);
  const descuento = Number(data?.descuento || 0);
  const recargo = Number(data?.recargo || 0);
  const descuentoAplicado =
    data?.tipo_descuento === "porcentaje" ? subtotal * (descuento / 100) : descuento;
  const recargoAplicado =
    data?.tipo_recargo === "porcentaje" ? subtotal * (recargo / 100) : recargo;
  const cantidadItems =
    Number(data?.cantidad_items || 0) ||
    productos.reduce((acc, item) => acc + Number(item?._cantidad || 0), 0);
  const nroTicket = getNumeroTicket();
  const alturaTicket = estimarAlturaTicket({
    productos,
    incluyeLogo: Boolean(logoempresa),
  });

  const productTableBody = [
    [
      { text: "CANT", style: "tProductsHeader", alignment: "center" },
      { text: "PRODUCTO", style: "tProductsHeader", alignment: "left" },
      { text: "P.U.", style: "tProductsHeader", alignment: "right" },
      { text: "IMPORTE", style: "tProductsHeader", alignment: "right" },
    ],
    ...productos.map((item) => [
      { text: Number(item?._cantidad || 0), style: "tProductsBody", alignment: "center" },
      {
        text: item?.nombre || item?._descripcion || "Producto",
        style: "tProductsBody",
        alignment: "left",
      },
      {
        text: FormatearNumeroDinero(
          Number(item?._precio_venta || 0),
          data?.currency,
          data?.iso
        ),
        style: "tProductsBody",
        alignment: "right",
      },
      {
        text: FormatearNumeroDinero(Number(item?._total || 0), data?.currency, data?.iso),
        style: "tProductsBody",
        alignment: "right",
      },
    ]),
  ];

  const content = [
    ...(logoempresa
      ? [
          {
            image: logoempresa,
            fit: [110, 54],
            alignment: "center",
            margin: [0, 0, 0, 6],
          },
        ]
      : []),
    { text: data?.nombre_empresa || "MI EMPRESA", style: "header" },
    { text: data?.direccion_empresa || "Direccion no informada", style: "subHeader" },
    { text: `ID FISCAL: ${data?.ruc_empresa || "-"}`, style: "subHeader" },
    crearDivider(),
    { text: "COMPROBANTE DE VENTA", style: "ticketTitle" },
    {
      margin: [0, 4, 0, 0],
      table: {
        widths: ["37%", "63%"],
        body: [
          [{ text: "Ticket:", style: "metaLabel" }, { text: nroTicket, style: "metaValue" }],
          [
            { text: "Fecha:", style: "metaLabel" },
            { text: formatFecha(data?.fecha_emision), style: "metaValue" },
          ],
          [{ text: "Sucursal:", style: "metaLabel" }, { text: data?.sucursal || "-", style: "metaValue" }],
          [{ text: "Vendedor:", style: "metaLabel" }, { text: data?.vendedor || "-", style: "metaValue" }],
          [{ text: "Cliente:", style: "metaLabel" }, { text: data?.cliente || "Cliente generico", style: "metaValue" }],
          [{ text: "Cobro:", style: "metaLabel" }, { text: data?.tipo_cobro || "-", style: "metaValue" }],
        ],
      },
      layout: "noBorders",
    },
    crearDivider(),
    {
      margin: [0, 3, 0, 4],
      table: {
        headerRows: 1,
        widths: ["15%", "43%", "20%", "22%"],
        body: productTableBody,
      },
      layout: {
        hLineWidth: (i) => (i === 1 ? 0.8 : 0),
        vLineWidth: () => 0,
        hLineColor: () => "#d8d8d8",
        paddingTop: () => 2,
        paddingBottom: () => 2,
        paddingLeft: () => 1,
        paddingRight: () => 1,
      },
    },
    crearDivider(),
    {
      table: {
        widths: ["58%", "42%"],
        body: [
          [{ text: "Items:", style: "resumeLabel" }, { text: String(cantidadItems), style: "resumeValue" }],
          [
            { text: "Subtotal:", style: "resumeLabel" },
            { text: FormatearNumeroDinero(subtotal, data?.currency, data?.iso), style: "resumeValue" },
          ],
          [
            { text: "Descuento:", style: "resumeLabel" },
            {
              text:
                descuentoAplicado > 0
                  ? `${FormatearNumeroDinero(
                      descuentoAplicado,
                      data?.currency,
                      data?.iso
                    )} (${data?.tipo_descuento === "porcentaje" ? "%" : "$"})`
                  : FormatearNumeroDinero(0, data?.currency, data?.iso),
              style: "resumeValue",
            },
          ],
          [
            { text: "Recargo:", style: "resumeLabel" },
            {
              text:
                recargoAplicado > 0
                  ? `${FormatearNumeroDinero(
                      recargoAplicado,
                      data?.currency,
                      data?.iso
                    )} (${data?.tipo_recargo === "porcentaje" ? "%" : "$"})`
                  : FormatearNumeroDinero(0, data?.currency, data?.iso),
              style: "resumeValue",
            },
          ],
          [
            { text: "TOTAL:", style: "totalLabel", alignment: "right" },
            {
              text: FormatearNumeroDinero(total, data?.currency, data?.iso),
              style: "totalValue",
              alignment: "right",
            },
          ],
        ],
      },
      layout: "noBorders",
    },
    crearDivider(),
    { text: "Gracias por su compra", style: "footer" },
    { text: "Conserve este comprobante", style: "footerSub" },
    { text: "Todos los derechos reservados |", style: "brandFooter" },
    { text: `(c) ${getYear()} STOCKY`, style: "brandFooterBold" },
  ];

  const styles = {
    header: { fontSize: 11, bold: true, alignment: "center" },
    subHeader: { fontSize: 8.5, alignment: "center", color: "#4f4f4f" },
    ticketTitle: { fontSize: 9.5, bold: true, alignment: "center", margin: [0, 0, 0, 3] },
    metaLabel: { fontSize: 8, bold: true, color: "#343434" },
    metaValue: { fontSize: 8, color: "#343434" },
    tProductsHeader: { fontSize: 8, bold: true, color: "#1f1f1f" },
    tProductsBody: { fontSize: 8.3, color: "#1f1f1f" },
    resumeLabel: { fontSize: 8.5, bold: true, alignment: "right" },
    resumeValue: { fontSize: 8.5, alignment: "right" },
    totalLabel: { fontSize: 10, bold: true },
    totalValue: { fontSize: 12.5, bold: true },
    footer: { fontSize: 9, alignment: "center", bold: true, margin: [0, 2, 0, 0] },
    footerSub: { fontSize: 8, alignment: "center", color: "#555", margin: [0, 1, 0, 0] },
    brandFooter: { fontSize: 7.6, alignment: "center", color: "#91a4b7", margin: [0, 3, 0, 0] },
    brandFooterBold: { fontSize: 8, alignment: "center", color: "#6f8498", bold: true, margin: [0, 0, 0, 0] },
  };

  const response = await createPdf(
    {
      content,
      styles,
      // 🚀 MAGIA AQUÍ: Usar height: "auto" hace que no haya saltos de página nunca. 
      // Quedará como un rollo térmico continuo perfecto de una sola tira.
      pageSize: { width: 226, height: alturaTicket },
      pageMargins: [8, 8, 8, 8],
    },
    output
  );
  return response;
};

export default TicketVenta;
