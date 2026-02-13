import styled from "styled-components";
import { Icon } from "@iconify/react";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useQuery } from "@tanstack/react-query";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { BarLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

export const CardHistorialVentas = () => {
  const navigate = useNavigate();
  const { dataempresa } = useEmpresaStore();
  const { datausuarios } = useUsuariosStore();
  const { mostrarVentasRecientes } = useVentasStore();
  const esAdmin = String(datausuarios?.roles?.nombre || "")
    .toLowerCase()
    .includes("admin");

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
        <HeaderActions>
          {esAdmin && (
            <ActionButton
              type="button"
              onClick={() => navigate("/dashboard/cierres-caja")}
            >
              Ver historial de cierres de caja
            </ActionButton>
          )}
          <Icon icon="mdi:history" width="24" color="#888" />
        </HeaderActions>
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
  gap: 10px;
  flex-wrap: wrap;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  color: ${({ theme }) => theme.text};
`;

const ActionButton = styled.button`
  border: 1px solid rgba(255, 189, 89, 0.55);
  background: rgba(255, 189, 89, 0.12);
  color: ${({ theme }) => theme.text};
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 189, 89, 0.2);
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
`;

const Table = styled.table`
  width: 100%;
  min-width: 760px;
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
