import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useThemeStore } from "../../../store/ThemeStore";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";
import { useDashboardStore } from "../../../store/DashboardStore";

// 1. ELIMINAMOS LOS IMPORTS DE LA ANIMACIÓN (Ya no se usan)
// import { Lottieanimacion } from "../../atomos/Lottieanimacion";
// import animacionvacio from "../../../assets/vacioanimacion.json";

export const ChartProductosTop5 = () => {
  const { dataempresa } = useEmpresaStore();
  const { porcentajeCambio } = useVentasStore();
  const { themeStyle } = useThemeStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
  
  // Variables no usadas (puedes borrarlas si quieres limpiar más)
  // const isPositive = porcentajeCambio > 0;
  // const isNeutral = porcentajeCambio === 0;

  const { mostrartop5productosmasvendidosxcantidad } = useDetalleVentasStore();
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "mostrar top5 productos mas vendidos xcantidad",
      {
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      },
    ],
    queryFn: () =>
      mostrartop5productosmasvendidosxcantidad({
        _id_empresa: dataempresa?.id,
        _fecha_inicio: fechaInicio,
        _fecha_fin: fechaFin,
      }),
    enabled: !!dataempresa?.id,
  });

  if (isLoading) return <BarLoader color="#6d6d6d" />;
  if (error) return <span>error...{error.message} </span>;

  return (
    <Container>
      <Header>
        <Title>TOP 5</Title>
        <Subtitle>Productos por cantidad vendida</Subtitle>
      </Header>
      
      {data && data.length > 0 ? (
        <>
          {data?.map((item, index) => {
            return (
              <Row key={index}>
                <NameContent>
                  <Name>{item.nombre_producto} </Name>
                </NameContent>
                <Stats>
                  <Value>{item.total_vendido} </Value>
                  <Percentage>{item.porcentaje} %</Percentage>
                </Stats>
              </Row>
            );
          })}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              width={500}
              height={400}
              data={data}
              margin={{
                top: 10,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <XAxis
                dataKey="nombre_producto"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                strokeWidth={6}
                type="monotone"
                dataKey="total_vendido"
                fill={themeStyle.text}
                activeDot={{ r: 6 }}
                fillOpacity={1}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        /* 2. REEMPLAZAMOS LA ANIMACIÓN POR UN MENSAJE SIMPLE */
        <EmptyState>
          <span>sin data...</span>
        </EmptyState>
      )}
    </Container>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <Date>{label} </Date>
        <Value>cant: {payload[0].value}</Value>
      </TooltipContainer>
    );
  }
};

// --- STYLED COMPONENTS ---

// Nuevo componente para el estado vacío (centra el texto)
const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px; /* Misma altura que tenía la animación */
  width: 100%;
  color: ${({ theme }) => theme.text}; /* Usa el color de texto del tema */
  opacity: 0.5; /* Un poco más suave */
  font-size: 14px;
`;

const Stats = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;
const Value = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colortitlecard};
`;
const Percentage = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: #828282;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 8px;
`;
const NameContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 2;
`;
const Name = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 5px 0 0;
  line-height: 1.2;
`;
const Container = styled.div`
  padding: 20px;
`;
const TooltipContainer = styled.div`
  background: ${({ theme }) => theme.bg};
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  box-shadow: ${({ theme }) => theme.boxshadow};
`;
const Date = styled.div`
  font-size: 14px;
`;

const Header = styled.div`
  margin-bottom: 20px;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;  
