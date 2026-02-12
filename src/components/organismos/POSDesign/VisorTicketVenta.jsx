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

    const response = await ticket(output, dataParaTicket);
    if (output === "b64") {
      setBase64(response?.content ?? "");
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
        <article className="contentverticket" onClick={setState}>
          <span>Ocultar ticket</span>
        </article>

        <iframe
          style={{ width: "100%", height: "100%" }}
          src={`data:application/pdf;base64,${base64}`}
        />
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
  height: 80%;
  display: flex;
  gap: 10px;
  flex-direction: column;
  width: 400px; /* Le damos un ancho fijo para que se vea bien */
  
  .contentverticket {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #ffbd59;
    padding: 10px;
    border-radius: 10px;
    justify-content: center;
    font-weight: bold;
    color: #fff;
    .icono{
        font-size: 25px;
    }
  }
`;
