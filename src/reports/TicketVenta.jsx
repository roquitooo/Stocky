import { urlToBase64, FormatearNumeroDinero } from "../utils/Conversiones";
import createPdf from "../utils/CreatePdf";

const TicketVenta = async (output, data) => {
  const logoempresa = data.logo ? await urlToBase64(data.logo) : null;

  // --- CUERPO DE PRODUCTOS ---
  const productTableBody = [
    [
      { text: "CANT", style: "tProductsHeader", alignment: "center" },
      { text: "DESCRIPCIÓN", style: "tProductsHeader", alignment: "left" },
      { text: "PRECIO", style: "tProductsHeader", alignment: "right" },
      { text: "TOTAL", style: "tProductsHeader", alignment: "right" },
    ],
    ...data.productos.map((item) => [
      { text: item._cantidad, style: "tProductsBody", alignment: "center" },
      { text: item.nombre || item._descripcion, style: "tProductsBody", alignment: "left" },
      { 
        text: FormatearNumeroDinero(item._precio_venta, data.currency, data.iso), 
        style: "tProductsBody", 
        alignment: "right" 
      },
      { 
        text: FormatearNumeroDinero(item._total, data.currency, data.iso), 
        style: "tProductsBody", 
        alignment: "right" 
      },
    ]),
  ];

  const content = [
    // LOGO Y DATOS
    logoempresa ? {
      image: logoempresa,
      fit: [100, 50],
      alignment: "center",
      margin: [0, 0, 0, 10]
    } : {},
    
    { text: data.nombre_empresa || "NOMBRE EMPRESA", style: "header" },
    { text: data.direccion_empresa || "Dirección desconocida", style: "subHeader" },
    { text: `RUC: ${data.ruc_empresa || "---"}`, style: "subHeader" },
    { text: "TICKET DE VENTA", style: "ticketNumber", margin: [0, 10, 0, 10] },

    // LÍNEA
    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 200, y2: 5, lineWidth: 1, lineCap: 'round', dash: { length: 2 } }] },
    
    // TABLA PRODUCTOS
    {
      margin: [0, 10, 0, 10],
      table: {
        widths: ["15%", "45%", "20%", "20%"],
        body: productTableBody,
      },
      layout: "noBorders",
    },

    // LÍNEA
    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 200, y2: 5, lineWidth: 1, lineCap: 'round', dash: { length: 2 } }] },

    // TOTALES FUNCIONALES
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: ["60%", "40%"],
        body: [
          [
            { text: "TOTAL A PAGAR:", style: "totalLabel", alignment: "right" },
            { 
              // AQUI ESTA LA MAGIA: Usamos el total real formateado
              text: FormatearNumeroDinero(data.total, data.currency, data.iso), 
              style: "totalValue", 
              alignment: "right" 
            },
          ],
          // Puedes agregar desglose de pago aquí si tienes los datos de "pago con" y "vuelto"
        ]
      },
      layout: "noBorders"
    },

    {
      text: "¡Gracias por su compra!",
      style: "footer",
      margin: [0, 20, 0, 0],
    },
  ];

  const styles = {
    header: { fontSize: 12, bold: true, alignment: "center" },
    subHeader: { fontSize: 9, alignment: "center", color: "#555" },
    ticketNumber: { fontSize: 10, bold: true, alignment: "center" },
    tProductsHeader: { fontSize: 8, bold: true, color: "#000", margin: [0, 2, 0, 2] },
    tProductsBody: { fontSize: 9, margin: [0, 2, 0, 2] },
    totalLabel: { fontSize: 11, bold: true },
    totalValue: { fontSize: 14, bold: true },
    footer: { fontSize: 10, alignment: "center", bold: true },
  };

  const response = await createPdf({ content, styles, pageSize: { width: 226, height: 'auto' } }, output);
  return response;
};

export default TicketVenta;