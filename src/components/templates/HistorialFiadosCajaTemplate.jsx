import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useCierreCajaStore } from "../../store/CierreCajaStore";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { FormatearNumeroDinero } from "../../utils/Conversiones";

const parseFechaLocal = (valor) => {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const txt = String(valor).trim();

  const m = txt.match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (m) {
    const [, y, mo, d, h, mi, s = "0"] = m;
    return new Date(
      Date.UTC(
        Number(y),
        Number(mo) - 1,
        Number(d),
        Number(h),
        Number(mi),
        Number(s)
      )
    );
  }

  return new Date(txt);
};

const formatFecha = (valor) => {
  if (!valor) return "-";
  const d = parseFechaLocal(valor);
  if (Number.isNaN(d.getTime())) return "-";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const formatDuracion = (inicio, fin) => {
  if (!inicio || !fin) return "-";
  const ini = parseFechaLocal(inicio)?.getTime?.();
  const end = parseFechaLocal(fin)?.getTime?.();
  if (!Number.isFinite(ini) || !Number.isFinite(end) || end < ini) return "-";
  const minutos = Math.floor((end - ini) / 60000);
  const horas = Math.floor(minutos / 60);
  const min = minutos % 60;
  return `${horas}h ${String(min).padStart(2, "0")}m`;
};

const parseDetalleFiado = (valor) => {
  const texto = String(valor || "").trim();
  if (!texto) {
    return { motivo: "-", descripcion: "-" };
  }

  const partes = texto
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  let motivo = "-";
  let descripcion = "-";

  partes.forEach((parte) => {
    if (/^motivo\s*:/i.test(parte)) {
      motivo = parte.replace(/^motivo\s*:/i, "").trim() || "-";
      return;
    }
    if (/^productos\s*:/i.test(parte)) {
      descripcion = parte.replace(/^productos\s*:/i, "").trim() || "-";
    }
  });

  if (descripcion === "-") {
    const resto = partes
      .filter((parte) => !/^fiado/i.test(parte) && !/^motivo\s*:/i.test(parte))
      .join(" | ")
      .trim();
    descripcion = resto || texto || "-";
  }

  return { motivo, descripcion };
};

export function HistorialFiadosCajaTemplate() {
  const { dataempresa } = useEmpresaStore();
  const { mostrarHistorialCierres, mostrarFiadosPorCierre } = useCierreCajaStore();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);

  const { data: cierres, isLoading } = useQuery({
    queryKey: [
      "historial cierres caja fiados",
      { id_empresa: dataempresa?.id, fechaInicio, fechaFin },
    ],
    queryFn: () =>
      mostrarHistorialCierres({
        id_empresa: dataempresa?.id,
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const actual = (cierres || []).find((item) => item.id === cierreSeleccionado);
    if (!actual) {
      setCierreSeleccionado(cierres?.[0]?.id ?? null);
    }
  }, [cierres, cierreSeleccionado]);

  const cierreActivo = (cierres || []).find((item) => item.id === cierreSeleccionado) || null;

  const { data: fiados, isLoading: loadingFiados } = useQuery({
    queryKey: [
      "fiados por cierre vista",
      { id_cierre_caja: cierreSeleccionado, fechaInicio, fechaFin },
    ],
    queryFn: () =>
      mostrarFiadosPorCierre({
        id_cierre_caja: cierreSeleccionado,
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      }),
    enabled: !!cierreSeleccionado,
    refetchOnWindowFocus: false,
  });

  const resumenFiados = useMemo(() => {
    const total = (fiados || []).reduce(
      (acc, item) => acc + Number(item?.monto || 0),
      0
    );
    return {
      cantidad: Array.isArray(fiados) ? fiados.length : 0,
      total,
    };
  }, [fiados]);

  return (
    <Container>
      <Header>
        <div className="left">
          <h1>Historial de fiados</h1>
          <p>Revisa fiados por cierre de caja con filtro de fechas.</p>
        </div>
        <BackButton to="/">
          <Icon icon="mdi:arrow-left" width={16} />
          Volver al dashboard
        </BackButton>
      </Header>

      <Filters>
        <label>
          Desde
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setFechaInicio("");
            setFechaFin("");
          }}
        >
          Limpiar filtro
        </button>
        <FilterLink to="/dashboard/cierres-caja">Ver movimientos de caja</FilterLink>
      </Filters>

      <Card>
        <CardTitle>Cierres de caja</CardTitle>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Duraci&oacute;n</th>
                <th>Sucursal</th>
                <th>Caja</th>
                <th>Cajero</th>
                <th>Estado</th>
                <th className="align-center">Fiados</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="8" className="empty">Cargando historial...</td>
                </tr>
              )}

              {!isLoading && (!cierres || cierres.length === 0) && (
                <tr>
                  <td colSpan="8" className="empty">Sin cierres para ese rango de fechas.</td>
                </tr>
              )}

              {!isLoading &&
                (cierres || []).map((item) => (
                  <tr key={item.id}>
                    <td>{formatFecha(item.fechainicio)}</td>
                    <td>{item.fechacierre ? formatFecha(item.fechacierre) : "-"}</td>
                    <td>{formatDuracion(item.fechainicio, item.fechacierre)}</td>
                    <td>{item.sucursal_nombre}</td>
                    <td>{item.caja_nombre}</td>
                    <td>{item.usuario_nombre}</td>
                    <td>
                      <Badge $open={Number(item.estado) === 0}>
                        {Number(item.estado) === 0 ? "Abierta" : "Cerrada"}
                      </Badge>
                    </td>
                    <td className="align-center">
                      <SelectButton
                        type="button"
                        onClick={() => setCierreSeleccionado(item.id)}
                        $active={item.id === cierreSeleccionado}
                      >
                        Ver fiados
                      </SelectButton>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Card>
        <CardTop>
          <CardTitle>
            Fiados del cierre {cierreActivo ? `#${cierreActivo.id}` : ""}
          </CardTitle>
          {cierreActivo && (
            <small>
              {cierreActivo.sucursal_nombre} - {cierreActivo.caja_nombre}
            </small>
          )}
        </CardTop>

        <ResumeRow>
          <Stat>
            <span>Cantidad de fiados</span>
            <strong>{resumenFiados.cantidad}</strong>
          </Stat>
          <Stat>
            <span>Total fiado</span>
            <strong>
              {FormatearNumeroDinero(
                resumenFiados.total,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </strong>
          </Stat>
        </ResumeRow>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th className="align-right">Monto</th>
                <th>Motivo</th>
                <th>Cajero</th>
                <th>Descripcion</th>
              </tr>
            </thead>
            <tbody>
              {!cierreSeleccionado && (
                <tr>
                  <td colSpan="5" className="empty">Selecciona un cierre para ver sus fiados.</td>
                </tr>
              )}
              {cierreSeleccionado && loadingFiados && (
                <tr>
                  <td colSpan="5" className="empty">Cargando fiados...</td>
                </tr>
              )}
              {cierreSeleccionado && !loadingFiados && (!fiados || fiados.length === 0) && (
                <tr>
                  <td colSpan="5" className="empty">No hay fiados en ese cierre para el filtro aplicado.</td>
                </tr>
              )}
              {cierreSeleccionado && !loadingFiados &&
                (fiados || []).map((item) => {
                  const detalle = parseDetalleFiado(item.descripcion);
                  return (
                    <tr key={item.id}>
                      <td>{formatFecha(item.fecha_movimiento)}</td>
                      <td className="align-right">
                        {FormatearNumeroDinero(
                          item.monto || 0,
                          dataempresa?.currency,
                          dataempresa?.iso
                        )}
                      </td>
                      <td>{detalle.motivo}</td>
                      <td>{item.usuario_nombre}</td>
                      <td>{detalle.descripcion}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(14px, 2.4vw, 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;

  .left h1 {
    margin: 0;
    font-size: clamp(1.25rem, 2vw, 1.8rem);
  }

  .left p {
    margin: 4px 0 0;
    opacity: 0.7;
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 189, 89, 0.45);
  color: ${({ theme }) => theme.text};
  background: rgba(255, 189, 89, 0.12);
  font-weight: 600;
`;

const Filters = styled.div`
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;

  label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 12px;
    color: #888;
  }

  input {
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    background: ${({ theme }) => theme.bgtotal};
    color: ${({ theme }) => theme.text};
    padding: 0 10px;
  }

  button {
    height: 36px;
    border-radius: 10px;
    border: 1px solid rgba(255, 189, 89, 0.45);
    background: rgba(255, 189, 89, 0.12);
    color: ${({ theme }) => theme.text};
    padding: 0 12px;
    cursor: pointer;
    font-weight: 600;
  }
`;

const FilterLink = styled(Link)`
  height: 36px;
  display: inline-flex;
  align-items: center;
  border-radius: 10px;
  border: 1px solid rgba(255, 189, 89, 0.45);
  background: rgba(255, 189, 89, 0.12);
  color: ${({ theme }) => theme.text};
  padding: 0 12px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
`;

const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.02) 48%,
      rgba(0, 0, 0, 0.04)
    ),
    ${({ theme }) => theme.body};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
  padding: 16px;
`;

const CardTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;

  small {
    opacity: 0.72;
  }
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
`;

const ResumeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;

  span {
    opacity: 0.72;
    font-size: 12px;
  }
`;

const TableContainer = styled.div`
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 860px;

  th {
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #8d8d8d;
    padding: 10px 8px;
    border-bottom: 1px solid ${({ theme }) => theme.bordercolorDash};
    white-space: nowrap;
  }

  td {
    padding: 12px 8px;
    border-bottom: 1px solid rgba(128, 128, 128, 0.12);
    font-size: 13px;
    white-space: nowrap;
  }

  .align-right {
    text-align: right;
  }

  .align-center {
    text-align: center;
  }

  .empty {
    text-align: center;
    padding: 22px 8px;
    opacity: 0.8;
  }
`;

const SelectButton = styled.button`
  border: 1px solid ${({ $active }) => ($active ? "rgba(255,189,89,0.78)" : "rgba(255,255,255,0.24)")};
  background: ${({ $active }) => ($active ? "rgba(255,189,89,0.22)" : "rgba(255,255,255,0.03)")};
  color: ${({ theme }) => theme.text};
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $open }) => ($open ? "#f59e0b" : "#22c55e")};
  background: ${({ $open }) =>
    $open ? "rgba(245, 158, 11, 0.14)" : "rgba(34, 197, 94, 0.14)"};
`;
