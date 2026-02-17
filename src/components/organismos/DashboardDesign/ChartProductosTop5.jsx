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
import { useThemeStore } from "../../../store/ThemeStore";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { useQuery } from "@tanstack/react-query";
import { BarLoader } from "react-spinners";
import { useDashboardStore } from "../../../store/DashboardStore";

export const ChartProductosTop5 = () => {
  const { dataempresa } = useEmpresaStore();
  const { themeStyle } = useThemeStore();
  const { fechaInicio, fechaFin } = useDashboardStore();
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
  if (error) return <span>Error...{error.message}</span>;

  return (
    <Container>
      <Header>
        <Title>TOP 5</Title>
        <Subtitle>Productos por cantidad vendida</Subtitle>
      </Header>

      {data && data.length > 0 ? (
        <>
          {data.map((item, index) => (
            <Row key={index}>
              <NameContent>
                <Name>{item.nombre_producto}</Name>
              </NameContent>
              <Stats>
                <Value>{item.total_vendido}</Value>
                <Percentage>{item.porcentaje}%</Percentage>
              </Stats>
            </Row>
          ))}

          <ChartWrap>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 8, right: 6, left: -12, bottom: 2 }}
              >
                <XAxis
                  dataKey="nombre_producto"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={18}
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total_vendido"
                  fill={themeStyle.text}
                  fillOpacity={1}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrap>
        </>
      ) : (
        <EmptyState>
          <span>Sin datos...</span>
        </EmptyState>
      )}
    </Container>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <Date>{label}</Date>
        <Value>cant: {payload[0].value}</Value>
      </TooltipContainer>
    );
  }

  return null;
};

const EmptyState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  color: ${({ theme }) => theme.text};
  opacity: 0.5;
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
  gap: 12px;
  margin-bottom: 8px;
`;

const NameContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 2;
  min-width: 0;
`;

const Name = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Subtitle = styled.p`
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 5px 0 0;
  line-height: 1.2;
`;

const Container = styled.div`
  padding: 14px 12px;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 12px 10px;
  }
`;

const ChartWrap = styled.div`
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 220px;
  margin-top: 8px;
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
  margin-bottom: 14px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
`;
