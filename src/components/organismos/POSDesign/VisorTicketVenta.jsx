import styled from "styled-components";
import { useMemo, useState } from "react";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import ticket from "../../../reports/TicketVenta";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useSucursalesStore } from "../../../store/SucursalesStore";
import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore";

const formatFecha = (value) => {
  const d = new Date(value || Date.now());
  if (Number.isNaN(d.getTime())) return "--";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

export function VisorTicketVenta() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const {
    items,
    total,
    subtotal,
    descuento,
    recargo,
    tipoDescuento,
    tipoRecargo,
    tipocobro,
  } = useCartVentasStore();
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();
  const { sucursalesItemSelect } = useSucursalesStore();
  const { cliproItemSelect } = useClientesProveedoresStore();
  const fechaEmision = useMemo(() => new Date().toISOString(), []);

  const dataPreview = useMemo(() => {
    const productos = Array.isArray(items) ? items : [];
    const cantidadItems = productos.reduce(
      (acc, item) => acc + Number(item?._cantidad || 0),
      0
    );

    const descuentoAplicado =
      tipoDescuento === "porcentaje"
        ? Number(subtotal || 0) * (Number(descuento || 0) / 100)
        : Number(descuento || 0);

    const recargoAplicado =
      tipoRecargo === "porcentaje"
        ? Number(subtotal || 0) * (Number(recargo || 0) / 100)
        : Number(recargo || 0);

    const sucursalNombre =
      sucursalesItemSelect?.sucursal ||
      sucursalesItemSelect?.nombre ||
      "Sucursal principal";

    return {
      productos,
      cantidadItems,
      descuentoAplicado,
      recargoAplicado,
      empresa: dataempresa?.nombre || "MI EMPRESA",
      direccion: dataempresa?.direccion_fiscal || dataempresa?.direccion || "Direccion no informada",
      fiscal: dataempresa?.id_fiscal || dataempresa?.identificador_fiscal || "-",
      vendedor: datausuarios?.nombres || "Cajero",
      sucursal: sucursalNombre,
      cliente: cliproItemSelect?.nombres || "Cliente generico",
      cobro: tipocobro || "-",
      fecha: formatFecha(fechaEmision),
      fechaEmision,
      subtotal: Number(subtotal || 0),
      total: Number(total || 0),
      moneda: dataempresa?.currency,
      iso: dataempresa?.iso,
    };
  }, [
    cliproItemSelect?.nombres,
    dataempresa?.currency,
    dataempresa?.direccion,
    dataempresa?.direccion_fiscal,
    dataempresa?.id_fiscal,
    dataempresa?.identificador_fiscal,
    dataempresa?.iso,
    dataempresa?.nombre,
    datausuarios?.nombres,
    descuento,
    items,
    recargo,
    subtotal,
    sucursalesItemSelect?.nombre,
    sucursalesItemSelect?.sucursal,
    tipoDescuento,
    tipoRecargo,
    tipocobro,
    total,
    fechaEmision,
  ]);

  const ticketPayload = useMemo(
    () => ({
      logo: dataempresa?.logo,
      nombre_empresa: dataPreview.empresa,
      direccion_empresa: dataPreview.direccion,
      ruc_empresa: dataPreview.fiscal,
      productos: dataPreview.productos,
      total: dataPreview.total,
      subtotal: dataPreview.subtotal,
      descuento: Number(descuento || 0),
      recargo: Number(recargo || 0),
      tipo_descuento: tipoDescuento,
      tipo_recargo: tipoRecargo,
      currency: dataPreview.moneda || "$",
      iso: dataPreview.iso || "ARS",
      vendedor: dataPreview.vendedor,
      sucursal: dataPreview.sucursal,
      cliente: dataPreview.cliente,
      tipo_cobro: dataPreview.cobro,
      cantidad_items: dataPreview.cantidadItems,
      fecha_emision: dataPreview.fechaEmision,
    }),
    [
      dataPreview.cantidadItems,
      dataPreview.cliente,
      dataPreview.cobro,
      dataPreview.direccion,
      dataPreview.empresa,
      dataPreview.fechaEmision,
      dataPreview.fiscal,
      dataPreview.iso,
      dataPreview.moneda,
      dataPreview.productos,
      dataPreview.subtotal,
      dataPreview.sucursal,
      dataPreview.total,
      dataPreview.vendedor,
      dataempresa?.logo,
      descuento,
      recargo,
      tipoDescuento,
      tipoRecargo,
    ]
  );

  const descargarPdf = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const response = await ticket("b64", ticketPayload);
      const base64 = String(response?.content || "");
      if (!base64) return;

      const bin = window.atob(base64);
      const len = bin.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = bin.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const marca = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `ticket-${marca}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const imprimirPdf = async () => {
    if (isPrinting) return;
    setIsPrinting(true);
    try {
      await ticket("print", ticketPayload);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Container>
      <TicketCard>
        <section className="acciones">
          <button
            type="button"
            onClick={imprimirPdf}
            disabled={isPrinting || isDownloading}
          >
            {isPrinting ? "Imprimiendo..." : "Imprimir"}
          </button>
          <button
            type="button"
            onClick={descargarPdf}
            disabled={isDownloading || isPrinting}
          >
            {isDownloading ? "Generando PDF..." : "Descargar PDF"}
          </button>
        </section>

        <header>
          <small>COMPROBANTE DE VENTA</small>
          <h3>{dataPreview.empresa}</h3>
          <p>{dataPreview.direccion}</p>
          <p>ID FISCAL: {dataPreview.fiscal}</p>
        </header>

        <section className="meta">
          <p><strong>Fecha:</strong> {dataPreview.fecha}</p>
          <p><strong>Sucursal:</strong> {dataPreview.sucursal}</p>
          <p><strong>Vendedor:</strong> {dataPreview.vendedor}</p>
          <p><strong>Cliente:</strong> {dataPreview.cliente}</p>
          <p><strong>Cobro:</strong> {dataPreview.cobro}</p>
        </section>

        <section className="productos">
          <table>
            <thead>
              <tr>
                <th>Cant</th>
                <th>Producto</th>
                <th>PU</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {dataPreview.productos.length === 0 && (
                <tr>
                  <td colSpan="4" className="empty">Sin productos</td>
                </tr>
              )}
              {dataPreview.productos.map((item, idx) => (
                <tr key={`${item?._id_producto || "p"}-${idx}`}>
                  <td>{Number(item?._cantidad || 0)}</td>
                  <td>{item?.nombre || item?._descripcion || "Producto"}</td>
                  <td>
                    {FormatearNumeroDinero(
                      Number(item?._precio_venta || 0),
                      dataPreview.moneda,
                      dataPreview.iso
                    )}
                  </td>
                  <td>
                    {FormatearNumeroDinero(
                      Number(item?._total || 0),
                      dataPreview.moneda,
                      dataPreview.iso
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="totales">
          <p><span>Items</span><strong>{dataPreview.cantidadItems}</strong></p>
          <p>
            <span>Subtotal</span>
            <strong>{FormatearNumeroDinero(dataPreview.subtotal, dataPreview.moneda, dataPreview.iso)}</strong>
          </p>
          <p>
            <span>Descuento</span>
            <strong>{FormatearNumeroDinero(dataPreview.descuentoAplicado, dataPreview.moneda, dataPreview.iso)}</strong>
          </p>
          <p>
            <span>Recargo</span>
            <strong>{FormatearNumeroDinero(dataPreview.recargoAplicado, dataPreview.moneda, dataPreview.iso)}</strong>
          </p>
          <p className="total">
            <span>TOTAL</span>
            <strong>{FormatearNumeroDinero(dataPreview.total, dataPreview.moneda, dataPreview.iso)}</strong>
          </p>
        </section>
      </TicketCard>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const TicketCard = styled.div`
  width: min(420px, 92vw);
  max-height: min(72vh, 760px);
  background: #f9f9f9;
  color: #111;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.24);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .acciones {
    padding: 8px 10px 0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;

    button {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid rgba(0, 0, 0, 0.2);
      background: #111;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }

    button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }

  header {
    text-align: center;
    padding: 10px 12px 8px;
    border-bottom: 1px dashed #c6c6c6;

    small {
      font-weight: 700;
      letter-spacing: 0.08em;
      font-size: 10px;
      color: #666;
    }

    h3 {
      margin: 4px 0 3px;
      font-size: 22px;
      line-height: 1.1;
    }

    p {
      margin: 1px 0;
      font-size: 12px;
      color: #404040;
    }
  }

  .meta {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2px;
    padding: 8px 12px;
    border-bottom: 1px dashed #c6c6c6;

    p {
      margin: 0;
      font-size: 12px;
      color: #242424;
    }
  }

  .productos {
    padding: 8px 10px;
    overflow: auto;
    max-height: min(34vh, 280px);

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    th,
    td {
      padding: 4px 2px;
      border-bottom: 1px solid #e3e3e3;
      text-align: left;
      vertical-align: top;
    }

    th:nth-child(1),
    td:nth-child(1) {
      width: 14%;
      text-align: center;
    }

    th:nth-child(2),
    td:nth-child(2) {
      width: 46%;
      word-break: break-word;
    }

    th:nth-child(3),
    td:nth-child(3),
    th:nth-child(4),
    td:nth-child(4) {
      width: 20%;
      text-align: right;
      white-space: nowrap;
    }

    .empty {
      text-align: center;
      color: #666;
    }
  }

  .totales {
    padding: 8px 12px 12px;
    border-top: 1px dashed #c6c6c6;

    p {
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 13px;
    }

    .total {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #cfcfcf;
      font-size: 18px;
      font-weight: 800;
    }
  }
`;
