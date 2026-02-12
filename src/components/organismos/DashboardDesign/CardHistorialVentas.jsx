import styled from "styled-components";
import { Icon } from "@iconify/react";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useQuery } from "@tanstack/react-query";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { BarLoader } from "react-spinners";

export const CardHistorialVentas = () => {
  const { dataempresa } = useEmpresaStore();
  const { mostrarVentasRecientes } = useVentasStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["mostrar ventas recientes", { _id_empresa: dataempresa?.id }],
    queryFn: () => mostrarVentasRecientes({ _id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingContainer><BarLoader color="#888" /></LoadingContainer>;
  if (error) return <span>Error al cargar historial</span>;

  return (
    <Container>
      <Header>
        <Title>Historial de Ventas Recientes</Title>
        <Icon icon="mdi:history" width="24" color="#888" />
      </Header>
      
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Productos</th>
              <th className="align-center">Cant.</th>
              <th>Vendedor</th>
              <th>Método</th>
              <th className="align-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item, index) => (
              <tr key={index}>
                <td className="fecha-col">{item.fecha}</td>
                <td className="productos-col">{item.productos || "Sin detalle"}</td>
                <td className="align-center font-bold">{item.cantidad_total}</td>
                <td>{item.vendedor}</td>
                <td>
                  <Badge $tipo={item.metodo}>{item.metodo}</Badge>
                </td>
                <td className="align-right font-bold">
                  {FormatearNumeroDinero(item.total, dataempresa?.currency, dataempresa?.iso)}
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
               <tr><td colSpan="6" style={{textAlign:"center", padding:"20px"}}>Sin ventas recientes</td></tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

// --- ESTILOS ---
// (Tus estilos se mantienen exactamente igual, no hace falta tocarlos)
const Container = styled.div`
  background-color: ${({ theme }) => theme.body};
  border-radius: 12px;
  padding: 20px;
  border: 2px solid ${({ theme }) => theme.bordercolorDash};
  width: 100%;
  height: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th {
    text-align: left;
    color: #888;
    font-weight: 500;
    padding: 10px 0;
    border-bottom: 1px solid ${({ theme }) => theme.bordercolorDash};
    white-space: nowrap;
  }

  td {
    padding: 15px 5px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.1);
    color: ${({ theme }) => theme.text};
  }

  .fecha-col {
    white-space: nowrap;
    font-size: 12px;
    color: #666;
  }

  .productos-col {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .align-right {
    text-align: right;
  }
  
  .align-center {
    text-align: center;
  }

  .font-bold {
    font-weight: 700;
  }
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  background-color: ${(props) => 
    props.$tipo === 'Efectivo' ? 'rgba(34, 197, 94, 0.1)' : 
    props.$tipo === 'Tarjeta' ? 'rgba(59, 130, 246, 0.1)' : 
    'rgba(128, 128, 128, 0.1)'};
  color: ${(props) => 
    props.$tipo === 'Efectivo' ? '#22c55e' : 
    props.$tipo === 'Tarjeta' ? '#3b82f6' : 
    '#888'};
`;