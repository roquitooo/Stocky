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
import { useUsuariosStore } from "../../store/UsuariosStore";
import { useDashboardStore } from "../../store/DashboardStore";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export const DashboardTemplate = () => {
  const navigate = useNavigate();
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  const { contarProductosBajoStock } = useAlmacenesStore();
  const { totalVentas, totalGananciaNeta } = useVentasStore();
  const esAdmin = String(datausuarios?.roles?.nombre || "")
    .toLowerCase()
    .includes("admin");

  const { data: cantidadBajoStock, isLoading: loadingStock } = useQuery({
    queryKey: ["contar bajo stock", { _id_empresa: dataempresa?.id }],
    queryFn: () => contarProductosBajoStock({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { data: totalVentasData, isLoading: loadingVentas } = useQuery({
    queryKey: ["sumar ventas totales", { _id_empresa: dataempresa?.id, fechaInicio, fechaFin }],
    queryFn: () =>
      totalVentas({
        id_empresa: dataempresa?.id,
        fechaInicio,
        fechaFin,
      }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  const { data: gananciaNetaData, isLoading: loadingGananciaNeta } = useQuery({
    queryKey: ["sumar ganancia neta", { _id_empresa: dataempresa?.id, fechaInicio, fechaFin }],
    queryFn: () =>
      totalGananciaNeta({
        id_empresa: dataempresa?.id,
        fechaInicio,
        fechaFin,
      }),
    enabled: !!dataempresa?.id && esAdmin,
    refetchOnWindowFocus: false,
  });

  return (
    <Container>
      <DashboardHeader />
      <MainContent>
        <Area1>
          <CardTotales
            value={
              loadingVentas
                ? "..."
                : FormatearNumeroDinero(
                    totalVentasData || 0,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )
            }
            title="Ventas Totales"
            icon={"mdi:currency-usd"}
            secondaryValue={
              esAdmin
                ? loadingGananciaNeta
                  ? "..."
                  : FormatearNumeroDinero(
                      gananciaNetaData || 0,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )
                : null
            }
            secondaryCaption={esAdmin ? "Ganancia neta" : null}
            caption="Ingresos generados en ventas"
          />

          <CardTotales
            value={loadingStock ? "..." : cantidadBajoStock || 0}
            title="Bajo Stock"
            icon={"mdi:package-variant-closed-minus"}
            caption="Productos requieren reposicion"
            actionLabel="Ver productos"
            actionIcon="mdi:arrow-right"
            onAction={() => navigate("/configuracion/productos?filtro=bajo-stock")}
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

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100%;
  max-width: 1400px;
  margin: auto;
  gap: 22px;
  padding: clamp(14px, 2.4vw, 24px);
  position: relative;
  z-index: 1;

  &::before {
    content: "";
    position: fixed;
    inset: 64px 0 28px 0;
    pointer-events: none;
    z-index: 0;
    background:
      radial-gradient(circle at 12% 18%, rgba(255, 189, 89, 0.08), transparent 38%),
      radial-gradient(circle at 88% 14%, rgba(255, 255, 255, 0.04), transparent 26%),
      radial-gradient(circle at 50% 90%, rgba(255, 189, 89, 0.035), transparent 40%);
  }
`;

const MainContent = styled.div`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-areas:
    "area1"
    "area2"
    "area3"
    "area4";
  grid-template-columns: 1fr;
  gap: clamp(14px, 1.8vw, 20px);

  @media ${Device.desktop} {
    grid-template-areas:
      "area1 area1 area3"
      "area2 area2 area3"
      "area4 area4 area4";
    grid-template-columns: 2fr 1fr 1fr;
    gap: clamp(14px, 1.8vw, 20px);
  }
`;

const Area1 = styled.section`
  grid-area: area1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(14px, 1.8vw, 20px);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Area2 = styled.section`
  grid-area: area2;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.02) 48%,
      rgba(0, 0, 0, 0.04)
    ),
    ${({ theme }) => theme.body};
  backdrop-filter: blur(4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
  min-height: 300px;
`;

const Area3 = styled.section`
  grid-area: area3;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.02) 48%,
      rgba(0, 0, 0, 0.04)
    ),
    ${({ theme }) => theme.body};
  backdrop-filter: blur(4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
  min-height: 300px;
`;

const Area4 = styled.section`
  grid-area: area4;
  display: flex;
  gap: clamp(14px, 1.8vw, 20px);
  width: 100%;
`;
