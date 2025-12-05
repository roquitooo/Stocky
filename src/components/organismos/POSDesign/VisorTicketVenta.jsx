import styled from "styled-components";
import ticket from "../../../reports/TicketVenta";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useEmpresaStore } from "../../../store/EmpresaStore"; // 1. Importar Store Empresa

export function VisorTicketVenta({ setState }) {
  const [base64, setBase64] = useState("");
  const { items, total } = useCartVentasStore(); // 2. Traer el total
  const { dataempresa } = useEmpresaStore(); // 3. Traer datos de empresa

  const onGenerateTicket = async (output) => {
    // 4. Preparamos el objeto con TODOS los datos reales
    const dataParaTicket = {
      // Tu logo fijo como fallback si no hay uno en la BD, como pediste:
      logo: dataempresa?.logo || "https://i.ibb.co/xKv00pwB/Stocky-logo.png",
      nombre_empresa: dataempresa?.nombre,
      direccion_empresa: dataempresa?.direccion_fiscal || dataempresa?.direccion,
      ruc_empresa: dataempresa?.id_fiscal || dataempresa?.identificador_fiscal,
      productos: items,
      total: total, // Pasamos el total real
      currency: dataempresa?.currency || "$",
      iso: dataempresa?.iso || "USD"
    };

    const response = await ticket(output, dataParaTicket);
    if (output === "b64") {
      setBase64(response?.content ?? "");
    }
  };

  useEffect(() => {
    onGenerateTicket("b64");
  }, []);

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