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

  // Maneja timestamp sin zona horaria (Postgres/Supabase) como UTC
  // y lo convierte a la zona local del navegador.
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

const normalizarTexto = (valor) =>
  String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const esMetodoEfectivo = (valorMetodo) =>
  normalizarTexto(valorMetodo).includes("efectivo");

const esMetodoDebito = (valorMetodo) => {
  const key = normalizarTexto(valorMetodo);
  return key.includes("debito") || key.includes("tarjeta");
};

const esVenta = (item) => {
  const idVentaRaw = item?.id_ventas;
  const idVentaNum = Number(idVentaRaw);
  return (
    idVentaRaw !== null &&
    idVentaRaw !== undefined &&
    String(idVentaRaw).trim() !== "" &&
    Number.isFinite(idVentaNum) &&
    idVentaNum > 0
  );
};

const esIngresoManual = (item) =>
  String(item?.tipo_movimiento || "").toLowerCase() === "ingreso" && !esVenta(item);

const esEgresoManual = (item) =>
  String(item?.tipo_movimiento || "").toLowerCase() === "salida" && !esVenta(item);

const filtrarMovimiento = (item, filtroMovimiento) => {
  const metodo = item?.metodo_pago;
  switch (filtroMovimiento) {
    case "pagos_efectivo":
      return esVenta(item) && esMetodoEfectivo(metodo);
    case "pagos_debito":
      return esVenta(item) && esMetodoDebito(metodo);
    case "ingresos_totales":
      return esIngresoManual(item);
    case "ingresos_efectivo":
      return esIngresoManual(item) && esMetodoEfectivo(metodo);
    case "ingresos_debito":
      return esIngresoManual(item) && esMetodoDebito(metodo);
    case "egresos_totales":
      return esEgresoManual(item);
    case "egresos_efectivo":
      return esEgresoManual(item) && esMetodoEfectivo(metodo);
    case "egresos_debito":
      return esEgresoManual(item) && esMetodoDebito(metodo);
    case "todos":
    default:
      return true;
  }
};

export function HistorialCierresCajaTemplate() {
  const { dataempresa } = useEmpresaStore();
  const { mostrarHistorialCierres, mostrarMovimientosPorCierre } = useCierreCajaStore();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);
  const [filtroMovimiento, setFiltroMovimiento] = useState("todos");
  const [ordenFecha, setOrdenFecha] = useState("desc");

  const { data: cierres, isLoading } = useQuery({
    queryKey: [
      "historial cierres caja",
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

  const { data: movimientos, isLoading: loadingMovimientos } = useQuery({
    queryKey: [
      "movimientos por cierre",
      { id_cierre_caja: cierreSeleccionado, fechaInicio, fechaFin },
    ],
    queryFn: () =>
      mostrarMovimientosPorCierre({
        id_cierre_caja: cierreSeleccionado,
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      }),
    enabled: !!cierreSeleccionado,
    refetchOnWindowFocus: false,
  });

  const resumenMovimientos = useMemo(() => {
    const base = { total: 0, ventas: 0, ingresos: 0, salidas: 0 };
    return (movimientos || []).reduce((acc, item) => {
      const monto = Number(item?.monto || 0);
      acc.total += monto;
      const tipo = String(item?.tipo_movimiento || "").toLowerCase();
      const idVentaRaw = item?.id_ventas;
      const idVentaNum = Number(idVentaRaw);
      const esMovimientoDeVenta =
        idVentaRaw !== null &&
        idVentaRaw !== undefined &&
        String(idVentaRaw).trim() !== "" &&
        Number.isFinite(idVentaNum) &&
        idVentaNum > 0;

      // Ventas: cualquier movimiento generado por una venta (id_ventas cargado).
      if (esMovimientoDeVenta) {
        acc.ventas += monto;
      }

      // Ingresos/Salidas: solo movimientos manuales de caja (sin id_ventas).
      if (!esMovimientoDeVenta && tipo === "ingreso") acc.ingresos += monto;
      if (!esMovimientoDeVenta && tipo === "salida") acc.salidas += monto;
      return acc;
    }, base);
  }, [movimientos]);

  const movimientosVista = useMemo(() => {
    const base = Array.isArray(movimientos) ? [...movimientos] : [];
    const filtrados = base.filter((item) => filtrarMovimiento(item, filtroMovimiento));

    filtrados.sort((a, b) => {
      const ta = parseFechaLocal(a?.fecha_movimiento)?.getTime?.() ?? 0;
      const tb = parseFechaLocal(b?.fecha_movimiento)?.getTime?.() ?? 0;
      return ordenFecha === "asc" ? ta - tb : tb - ta;
    });

    return filtrados;
  }, [movimientos, filtroMovimiento, ordenFecha]);

  const opcionesFiltroMovimiento = [
    { id: "todos", label: "Todos" },
    { id: "pagos_efectivo", label: "Pagos en efectivo" },
    { id: "pagos_debito", label: "Pagos en debito" },
    { id: "ingresos_totales", label: "Ingresos totales" },
    { id: "ingresos_efectivo", label: "Ingresos en efectivo" },
    { id: "ingresos_debito", label: "Ingresos en debito" },
    { id: "egresos_totales", label: "Egresos totales" },
    { id: "egresos_efectivo", label: "Egresos en efectivo" },
    { id: "egresos_debito", label: "Egresos en debito" },
  ];

  return (
    <Container>
      <Header>
        <div className="left">
          <h1>Historial de cierres de caja</h1>
          <p>Revisa cierres y movimientos por turno de caja con filtro de fechas.</p>
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
        <FilterLink to="/dashboard/egresos-stock-caja">Ver egresos de stock</FilterLink>
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
                <th className="align-right">Efectivo calc.</th>
                <th className="align-right">Efectivo real</th>
                <th className="align-right">Diferencia</th>
                <th className="align-center">Movimientos</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan="11" className="empty">Cargando historial...</td>
                </tr>
              )}

              {!isLoading && (!cierres || cierres.length === 0) && (
                <tr>
                  <td colSpan="11" className="empty">Sin cierres para ese rango de fechas.</td>
                </tr>
              )}

              {!isLoading &&
                (cierres || []).map((item) => {
                  const diferencia = Number(item?.diferencia_efectivo || 0);
                  return (
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
                      <td className="align-right">
                        {FormatearNumeroDinero(
                          item.total_efectivo_calculado || 0,
                          dataempresa?.currency,
                          dataempresa?.iso
                        )}
                      </td>
                      <td className="align-right">
                        {FormatearNumeroDinero(
                          item.total_efectivo_real || 0,
                          dataempresa?.currency,
                          dataempresa?.iso
                        )}
                      </td>
                      <td className={`align-right ${diferencia < 0 ? "neg" : diferencia > 0 ? "pos" : ""}`}>
                        {FormatearNumeroDinero(
                          diferencia,
                          dataempresa?.currency,
                          dataempresa?.iso
                        )}
                      </td>
                      <td className="align-center">
                        <SelectButton
                          type="button"
                          onClick={() => setCierreSeleccionado(item.id)}
                          $active={item.id === cierreSeleccionado}
                        >
                          Ver movimientos
                        </SelectButton>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </TableContainer>
      </Card>

      <Card>
        <CardTop>
          <CardTitle>
            Movimientos del cierre {cierreActivo ? `#${cierreActivo.id}` : ""}
          </CardTitle>
          {cierreActivo && (
            <small>
              {cierreActivo.sucursal_nombre} - {cierreActivo.caja_nombre}
            </small>
          )}
        </CardTop>

        <SubFilters>
          {opcionesFiltroMovimiento.map((item) => (
            <SelectButton
              key={item.id}
              type="button"
              onClick={() => setFiltroMovimiento(item.id)}
              $active={filtroMovimiento === item.id}
            >
              {item.label}
            </SelectButton>
          ))}
        </SubFilters>

        <ResumeRow>
          <Stat>
            <span>Total mov.</span>
            <strong>
              {FormatearNumeroDinero(
                resumenMovimientos.total,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </strong>
          </Stat>
          <Stat>
            <span>Ventas</span>
            <strong>
              {FormatearNumeroDinero(
                resumenMovimientos.ventas,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </strong>
          </Stat>
          <Stat>
            <span>Ingresos</span>
            <strong>
              {FormatearNumeroDinero(
                resumenMovimientos.ingresos,
                dataempresa?.currency,
                dataempresa?.iso
              )}
            </strong>
          </Stat>
          <Stat>
            <span>Salidas</span>
            <strong>
              {FormatearNumeroDinero(
                resumenMovimientos.salidas,
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
                <th>
                  <SortButton
                    type="button"
                    onClick={() =>
                      setOrdenFecha((prev) => (prev === "desc" ? "asc" : "desc"))
                    }
                  >
                    Fecha
                    <span>{ordenFecha === "desc" ? "▼" : "▲"}</span>
                  </SortButton>
                </th>
                <th>Tipo</th>
                <th>M&eacute;todo</th>
                <th>Descripci&oacute;n</th>
                <th className="align-right">Monto</th>
                <th>Cajero</th>
                <th>Productos</th>
                <th>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {!cierreSeleccionado && (
                <tr>
                  <td colSpan="8" className="empty">Selecciona un cierre para ver sus movimientos.</td>
                </tr>
              )}
              {cierreSeleccionado && loadingMovimientos && (
                <tr>
                  <td colSpan="8" className="empty">Cargando movimientos...</td>
                </tr>
              )}
              {cierreSeleccionado && !loadingMovimientos && (!movimientosVista || movimientosVista.length === 0) && (
                <tr>
                  <td colSpan="8" className="empty">No hay movimientos para el filtro aplicado.</td>
                </tr>
              )}
              {cierreSeleccionado && !loadingMovimientos &&
                (movimientosVista || []).map((item) => (
                  <tr key={item.id}>
                    <td>{formatFecha(item.fecha_movimiento)}</td>
                    <td>{item.tipo_movimiento || "-"}</td>
                    <td>{item.metodo_pago}</td>
                    <td>
                      <div className="desc-wrap">
                        <span>{item.descripcion || "-"}</span>
                        {Number(item?.descuento_monto || 0) > 0 && (
                          <small className="discount-note">
                            Descuento aplicado:{" "}
                            {FormatearNumeroDinero(
                              item.descuento_monto || 0,
                              dataempresa?.currency,
                              dataempresa?.iso
                            )}{" "}
                            ({Number(item.descuento_porcentaje || 0).toFixed(2)}%)
                          </small>
                        )}
                      </div>
                    </td>
                    <td className="align-right">
                      {FormatearNumeroDinero(
                        item.monto || 0,
                        dataempresa?.currency,
                        dataempresa?.iso
                      )}
                    </td>
                    <td>{item.usuario_nombre}</td>
                    <td>{item.productos_vendidos || "-"}</td>
                    <td>{item.comprobante}</td>
                  </tr>
                ))}
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

const SubFilters = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
`;

const ResumeRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

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
  min-width: 1020px;

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

  .desc-wrap {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .discount-note {
    color: #f59e0b;
    font-size: 11px;
    font-weight: 700;
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

  .neg {
    color: #ef4444;
    font-weight: 700;
  }
  .pos {
    color: #22c55e;
    font-weight: 700;
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

const SortButton = styled.button`
  border: none;
  background: transparent;
  color: inherit;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  font: inherit;
  cursor: pointer;

  span {
    font-size: 10px;
    opacity: 0.85;
  }
`;
