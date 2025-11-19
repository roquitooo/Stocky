import styled from "styled-components";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { useVentasStore } from "../../../store/VentasStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useThemeStore } from "../../../store/ThemeStore";
export const ChartVentas = () => {
  const { dataempresa } = useEmpresaStore();
  const { porcentajeCambio } = useVentasStore();

  const {themeStyle} = useThemeStore()
  const isPositive = porcentajeCambio > 0;
  const isNeutral = porcentajeCambio === 0;

  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];
  return (
    <Container>
      <Header>
        <Title>Total ventas</Title>
      </Header>
      <MainInfo>
        <Revenue>
          {FormatearNumeroDinero(1000, dataempresa?.currency, dataempresa?.iso)}
        </Revenue>
        <Change>
          <Percentage>
            <Icon  width="26"
              height="26"
              icon={
                isNeutral
                  ? "akar-icons:minus"
                  : isPositive
                  ? "iconamoon:arrow-up-2-fill"
                  : "iconamoon:arrow-down-2-fill"
              }
            ></Icon>
            56% al periodo anterior
          </Percentage>
        </Change>
      </MainInfo>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
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
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={themeStyle.text} stopOpacity={0.2} />
              <stop offset="95%" stopColor={themeStyle.text} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeOpacity={0.2} vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area
            strokeWidth={1.5}
            type="monotone"
            dataKey="uv"
            stroke={themeStyle.text}
            fill="url(#colorValue)"
            activeDot={{ r: 6 }}
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Container>
  );
};
const CustomTooltip = ({ active, payload, label }) => {
  const { dataempresa } = useEmpresaStore();
  if (active && payload && payload.length) {
    return (
      <TooltipContainer>
        <Date>{label} </Date>
        <Value>
          {FormatearNumeroDinero(
            payload[0].value,
            dataempresa?.currency,
            dataempresa?.iso
          )}
        </Value>
      </TooltipContainer>
    );
  }
};
const Container = styled.div`
 
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

const Value = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left:20px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;
const MainInfo = styled.div`
  margin: 20px 0;
  padding-left:20px;
`;
const Revenue = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;
const Change = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 5px;
`;
const Percentage = styled.span`
  display: flex;
  text-align: center;
  align-items: center;
  font-size: 14px;
  color: ${(props) =>
    props.isNeutral ? "#6b7280" : props.isPositive ? "#12ca3a" : "#d32f5b"};
`;
