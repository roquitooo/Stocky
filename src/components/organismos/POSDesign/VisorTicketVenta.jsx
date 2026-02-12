import styled from "styled-components";
import ticket from "../../../reports/TicketVenta";
import { useEffect, useState } from "react";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useSucursalesStore } from "../../../store/SucursalesStore";
import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore";

export function VisorTicketVenta({ setState }) {
  const [base64, setBase64] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const {
    items,
    total,
    subtotal,
    descuento,
    tipoDescuento,
    tipocobro,
  } = useCartVentasStore();
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();
  const { sucursalesItemSelect } = useSucursalesStore();
  const { cliproItemSelect } = useClientesProveedoresStore();

  const onGenerateTicket = async (output) => {
    setIsLoading(true);
    setErrorMsg("");
    const sucursalNombre =
      sucursalesItemSelect?.sucursal ||
      sucursalesItemSelect?.nombre ||
      "Sucursal principal";
    const clienteNombre = cliproItemSelect?.nombres || "Cliente generico";
    const cantidadItems = (items || []).reduce(
      (acc, item) => acc + Number(item?._cantidad || 0),
      0
    );

    const dataParaTicket = {
      logo: dataempresa?.logo || "https://i.ibb.co/xKv00pwB/Stocky-logo.png",
      nombre_empresa: dataempresa?.nombre,
      direccion_empresa: dataempresa?.direccion_fiscal || dataempresa?.direccion,
      ruc_empresa: dataempresa?.id_fiscal || dataempresa?.identificador_fiscal,
      productos: items,
      total,
      subtotal,
      descuento,
      tipo_descuento: tipoDescuento,
      currency: dataempresa?.currency || "$",
      iso: dataempresa?.iso || "USD",
      vendedor: datausuarios?.nombres || "Cajero",
      sucursal: sucursalNombre,
      cliente: clienteNombre,
      tipo_cobro: tipocobro || "-",
      cantidad_items: cantidadItems,
      fecha_emision: new Date().toISOString(),
    };

    try {
      const response = await ticket(output, dataParaTicket);
      if (output === "b64") {
        setBase64(response?.content ?? "");
      }
    } catch (error) {
      setErrorMsg("No se pudo generar el ticket.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    onGenerateTicket("b64");
  }, [
    items,
    total,
    subtotal,
    descuento,
    tipoDescuento,
    tipocobro,
    dataempresa,
    datausuarios,
    sucursalesItemSelect,
    cliproItemSelect,
  ]);

  return (
    <Container>
      <ContentTicket>
        {isLoading && <div className="status">Generando ticket...</div>}
        {!!errorMsg && <div className="status error">{errorMsg}</div>}
        {!isLoading && !errorMsg && base64 ? (
          <iframe
            style={{ width: "100%", height: "100%" }}
            src={`data:application/pdf;base64,${base64}`}
          />
        ) : null}
      </ContentTicket>
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  z-index: 2;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.bgtotal};
`;
const ContentTicket = styled.div`
  height: min(78vh, 820px);
  display: flex;
  gap: 10px;
  flex-direction: column;
  width: min(420px, 92vw);

  .status {
    min-height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 189, 89, 0.45);
    border-radius: 12px;
    background: rgba(255, 189, 89, 0.12);
    font-weight: 700;
    color: ${({ theme }) => theme.text};
  }

  .status.error {
    border-color: rgba(239, 68, 68, 0.45);
    background: rgba(239, 68, 68, 0.12);
  }
`;
