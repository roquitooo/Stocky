import styled from "styled-components";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { useVentasStore } from "../../../store/VentasStore"; 
import { useThemeStore } from "../../../store/ThemeStore";
import { useQuery } from "@tanstack/react-query";
import { useDashboardStore } from "../../../store/DashboardStore"; // 1. IMPORTAR ESTO

export const ChartVentas = () => {
  const { dataempresa } = useEmpresaStore();
  const { themeStyle } = useThemeStore();
  const { mostrarVentasGrafico } = useVentasStore();
  
  // 2. EXTRAER LAS FECHAS DEL FILTRO
  const { fechaInicio, fechaFin } = useDashboardStore();

  const { data: dataGrafico, isLoading } = useQuery({
    // 3. AGREGAR FECHAS A LA QUERY KEY (Para que recargue al cambiar)
    queryKey: ["mostrar ventas grafico", { _id_empresa: dataempresa?.id, fechaInicio, fechaFin }],
    
    // 4. PASAR LAS FECHAS A LA FUNCIÓN
    queryFn: () => mostrarVentasGrafico({ 
        id_empresa: dataempresa?.id,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin
    }),
    
    // Solo ejecutar si hay empresa Y fechas definidas
    enabled: !!dataempresa?.id && !!fechaInicio && !!fechaFin,
    refetchOnWindowFocus: false,
  });

  const data = dataGrafico && dataGrafico.length > 0 ? dataGrafico : [
    { fecha: "Sin datos", total: 0 }
  ];

  return (
    <Container>
      <Header>
        <Title>Tendencia de Ventas</Title>
        {/* Opcional: Mostrar el rango seleccionado */}
        {fechaInicio && <SubTitle>{fechaInicio} al {fechaFin}</SubTitle>}
      </Header>
      
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 8, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={themeStyle.text} stopOpacity={0.3} />
              <stop offset="95%" stopColor={themeStyle.text} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeOpacity={0.1} vertical={false} />
          <XAxis
            dataKey="fecha"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={18}
            tick={{ fontSize: 11, fill: "#888" }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="total" stroke={themeStyle.text} strokeWidth={2} fill="url(#colorValue)" activeDot={{ r: 6 }} />
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
        <DateLabel>{label}</DateLabel>
        <ValueLabel>
          {FormatearNumeroDinero(payload[0].value, dataempresa?.currency, dataempresa?.iso)}
        </ValueLabel>
      </TooltipContainer>
    );
  }
  return null;
};

// --- ESTILOS ---
const Container = styled.div`
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;
const Header = styled.div`
  margin-bottom: 12px;
  padding-left: 2px;
`;
const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text};
  margin: 0;
  line-height: 1.2;
`;
const SubTitle = styled.span`
  font-size: 12px;
  color: #888;
  font-weight: 500;
  line-height: 1.2;
`;
const TooltipContainer = styled.div` background: ${({ theme }) => theme.bg}; padding: 10px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); border: 1px solid ${({ theme }) => theme.bordercolorDash}; `;
const DateLabel = styled.div` font-size: 12px; color: #888; margin-bottom: 4px; `;
const ValueLabel = styled.div` font-size: 16px; font-weight: 800; color: ${({ theme }) => theme.text}; `;
