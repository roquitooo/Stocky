import styled from "styled-components";
import { Device } from "../../styles/breakpoints";
import { DashboardHeader } from "../organismos/DashboardDesign/DashboardHeader";
import { CardTotales } from "../organismos/DashboardDesign/CardTotales";
import { ChartVentas } from "../organismos/DashboardDesign/ChartVentas";
import { ChartProductosTop5 } from "../organismos/DashboardDesign/ChartProductosTop5";
import { CardHistorialVentas } from "../organismos/DashboardDesign/CardHistorialVentas";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { FormatearNumeroDinero } from "../../utils/Conversiones";
import { useAlmacenesStore } from "../../store/AlmacenesStore";
import { useVentasStore } from "../../store/VentasStore"; 
import { useQuery } from "@tanstack/react-query";

export const DashboardTemplate = () => {
  const { dataempresa } = useEmpresaStore();
  const { contarProductosBajoStock } = useAlmacenesStore();
  const { totalVentas } = useVentasStore(); 

  // 1. Consulta Bajo Stock
  const { data: cantidadBajoStock, isLoading: loadingStock } = useQuery({
    queryKey: ["contar bajo stock", { _id_empresa: dataempresa?.id }],
    queryFn: () => contarProductosBajoStock({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  // 2. Consulta Ventas Totales
  const { data: totalVentasData, isLoading: loadingVentas } = useQuery({
    queryKey: ["sumar ventas totales", { _id_empresa: dataempresa?.id }],
    queryFn: () => totalVentas({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  return (
    <Container>
      <DashboardHeader />
      <MainContent>
        <Area1>
          {/* Tarjeta 1: VENTAS TOTALES (Conectada) */}
          <CardTotales
            // percentage={10} // Puedes descomentar si calculas porcentaje
            value={loadingVentas ? "..." : FormatearNumeroDinero(totalVentasData || 0, dataempresa?.currency, dataempresa?.iso)}
            title="Ventas Totales"
            icon={"mdi:currency-usd"}
            caption="Ingeresos generados en ventas"
          />

          {/* Tarjeta 2: BAJO STOCK (Conectada) */}
          <CardTotales
            value={loadingStock ? "..." : cantidadBajoStock || 0}
            title="Bajo Stock"
            icon={"mdi:package-variant-closed-minus"}
            caption="Productos requieren reposición"
          />
        </Area1>

        <Area2>
          <ChartVentas />
        </Area2>

        <Area3>
          <ChartProductosTop5 />
        </Area3>

        <Area4>
          <CardHistorialVentas />
        </Area4>
      </MainContent>
    </Container>
  );
};

// --- ESTILOS ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-width: 1400px;
  margin: auto;
  gap: 20px;
  padding: 20px;
`;

const MainContent = styled.div`
  display: grid;
  grid-template-areas:
    "area1"
    "area2"
    "area3"
    "area4";
  grid-template-columns: 1fr;
  gap: 20px;

  @media ${Device.desktop} {
    grid-template-areas:
      "area1 area1 area3"
      "area2 area2 area3"
      "area4 area4 area4";
    grid-template-columns: 2fr 1fr 1fr;
    gap: 20px;
  }
`;

const Area1 = styled.section`
  grid-area: area1;
  display: grid;
  /* Mantenemos 2 columnas, si agregas más tarjetas cambia a 'repeat(3, 1fr)' */
  grid-template-columns: repeat(2, 1fr); 
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr; 
  }
`;

const Area2 = styled.section`
  grid-area: area2;
  border: 2px solid ${({ theme }) => theme.bordercolorDash};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.body};
  min-height: 300px;
`;

const Area3 = styled.section`
  grid-area: area3;
  background-color: ${({ theme }) => theme.body};
  border: 2px solid ${({ theme }) => theme.bordercolorDash};
  border-radius: 20px;
  min-height: 300px;
`;

const Area4 = styled.section`
  grid-area: area4;
  display: flex;
  gap: 20px;
  width: 100%;
`;