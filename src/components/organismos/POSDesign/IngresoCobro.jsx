import styled from "styled-components";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { InputText } from "../formularios/InputText";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Btn1 } from "../../moleculas/Btn1";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useSucursalesStore } from "../../../store/SucursalesStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useDetalleVentasStore } from "../../../store/DetalleVentasStore";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Switch1 } from "../../atomos/Switch1";
import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { useMovCajaStore } from "../../../store/MovCajaStore";
import { useFormattedDate } from "../../../hooks/useFormattedDate";

export const IngresoCobro = forwardRef((props, ref) => {
  const fechaActual = useFormattedDate();

  const {
    tipocobro,
    total,
    subtotal,
    items,
    setStatePantallaCobro,
    resetState,
    aplicarDescuento,
    aplicarRecargo,
    descuento,
    recargo,
    tipoDescuento,
    tipoRecargo,
  } = useCartVentasStore();

  const [valoresPago, setValoresPago] = useState({});
  const [vuelto, setVuelto] = useState(0);
  const [restante, setRestante] = useState(0);
  const [esPorcentaje, setEsPorcentaje] = useState(tipoDescuento === "porcentaje");
  const [esPorcentajeRecargo, setEsPorcentajeRecargo] = useState(
    tipoRecargo === "porcentaje"
  );

  const { dataMetodosPago } = useMetodosPagoStore();
  const { datausuarios } = useUsuariosStore();
  const { sucursalesItemSelect } = useSucursalesStore();
  const sucursalActiva = Array.isArray(sucursalesItemSelect)
    ? sucursalesItemSelect[0]
    : sucursalesItemSelect;
  const idSucursalSeguro =
    sucursalActiva?.id_sucursal ??
    sucursalActiva?.id ??
    sucursalActiva?._id_sucursal ??
    null;

  const { dataempresa } = useEmpresaStore();
  const { idventa, insertarVentas, resetearventas } = useVentasStore();
  const { insertarDetalleVentas } = useDetalleVentasStore();
  const { dataCierreCaja } = useCierreCajaStore();
  const { insertarMovCaja } = useMovCajaStore();
  const { cliproItemSelect } = useClientesProveedoresStore();

  const normalizarMetodo = (valor) =>
    String(valor || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const esMetodoEfectivo = (item) =>
    normalizarMetodo(item?.nombre).includes("efectivo");
  const esMetodoTarjeta = (item) => {
    const key = normalizarMetodo(item?.nombre);
    return key.includes("tarjeta") || key.includes("debito");
  };

  const metodosCobroDisponibles = (dataMetodosPago || []).filter(
    (item) => esMetodoEfectivo(item) || esMetodoTarjeta(item)
  );

  const sanitizarEntero = (value, { maxDigitos, maxValor } = {}) => {
    const soloDigitos = String(value ?? "").replace(/\D/g, "");
    if (!soloDigitos) return "";

    const truncado = maxDigitos ? soloDigitos.slice(0, maxDigitos) : soloDigitos;
    let numero = Number.parseInt(truncado, 10);
    if (!Number.isFinite(numero)) return "";

    if (Number.isFinite(maxValor)) {
      numero = Math.min(numero, maxValor);
    }

    return String(numero);
  };

  const bloquearTeclasNoEnteras = (e) => {
    if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
      e.preventDefault();
    }
  };

  const limitesDescuento = {
    maxDigitos: esPorcentaje ? 3 : 10,
    maxValor: esPorcentaje ? 100 : undefined,
  };
  const limitesRecargo = {
    maxDigitos: esPorcentajeRecargo ? 3 : 10,
    maxValor: esPorcentajeRecargo ? 100 : undefined,
  };

  const handleDescuentoChange = (e) => {
    const valorSanitizado = sanitizarEntero(e.target.value, limitesDescuento);
    aplicarDescuento(
      valorSanitizado === "" ? 0 : Number(valorSanitizado),
      esPorcentaje ? "porcentaje" : "monto"
    );
  };

  const toggleTipoDescuento = () => {
    const nuevoTipo = !esPorcentaje;
    setEsPorcentaje(nuevoTipo);
    const valorNormalizado = sanitizarEntero(descuento, {
      maxDigitos: nuevoTipo ? 3 : 10,
      maxValor: nuevoTipo ? 100 : undefined,
    });
    aplicarDescuento(
      valorNormalizado === "" ? 0 : Number(valorNormalizado),
      nuevoTipo ? "porcentaje" : "monto"
    );
  };

  const handleRecargoChange = (e) => {
    const valorSanitizado = sanitizarEntero(e.target.value, limitesRecargo);
    aplicarRecargo(
      valorSanitizado === "" ? 0 : Number(valorSanitizado),
      esPorcentajeRecargo ? "porcentaje" : "monto"
    );
  };

  const toggleTipoRecargo = () => {
    const nuevoTipo = !esPorcentajeRecargo;
    setEsPorcentajeRecargo(nuevoTipo);
    const valorNormalizado = sanitizarEntero(recargo, {
      maxDigitos: nuevoTipo ? 3 : 10,
      maxValor: nuevoTipo ? 100 : undefined,
    });
    aplicarRecargo(
      valorNormalizado === "" ? 0 : Number(valorNormalizado),
      nuevoTipo ? "porcentaje" : "monto"
    );
  };

  const descuentoAplicado =
    tipoDescuento === "porcentaje"
      ? Number(subtotal || 0) * (Number(descuento || 0) / 100)
      : Number(descuento || 0);
  const recargoAplicado =
    tipoRecargo === "porcentaje"
      ? Number(subtotal || 0) * (Number(recargo || 0) / 100)
      : Number(recargo || 0);

  const calcularVueltoYRestante = () => {
    const totalPagado = Object.values(valoresPago).reduce((acc, curr) => acc + curr, 0);
    const precioFinal = total;

    const totalSinEfectivo = totalPagado - (valoresPago["Efectivo"] || 0);

    if (totalSinEfectivo > precioFinal) {
      setVuelto(0);
      setRestante(precioFinal - totalSinEfectivo);
    } else {
      if (totalPagado >= precioFinal) {
        const exceso = totalPagado - precioFinal;
        setVuelto(valoresPago["Efectivo"] ? exceso : 0);
        setRestante(0);
      } else {
        setVuelto(0);
        setRestante(precioFinal - totalPagado);
      }
    }
  };

  const handleChangePago = (tipo, valor) => {
    setValoresPago((prev) => ({
      ...prev,
      [tipo]: parseFloat(valor) || 0,
    }));
  };

  useImperativeHandle(ref, () => ({
    mutateAsync: mutation.mutateAsync,
  }));

  const mutation = useMutation({
    mutationKey: "insertar ventas",
    mutationFn: insertarventas,
    onSuccess: (result) => {
      if (!result?.ok) return;
      setStatePantallaCobro({ tipocobro: "" });
      resetState();
      resetearventas();
      toast.success("Venta generada!");
    },
  });

  async function insertarventas() {
    if (restante !== 0) {
      if (restante > 0) {
        toast.warning("Falta completar el pago");
      } else {
        toast.warning("El pago en tarjeta/debito no puede superar el total.");
      }
      return { ok: false };
    }

    if (!idSucursalSeguro) {
      toast.error("No se detectó sucursal activa. Selecciona una sucursal antes de cobrar.");
      return { ok: false };
    }

    const totalPagado = Object.values(valoresPago).reduce(
      (acc, curr) => acc + Number(curr || 0),
      0
    );
    const cantidadProductosVendidos = (items || []).reduce(
      (acc, item) => acc + Number(item?._cantidad || 0),
      0
    );
    const subTotalVenta = Number(subtotal || 0);

    const pventas = {
      fecha: fechaActual,
      id_cliente: cliproItemSelect?.id,
      id_usuario: datausuarios?.id,
      id_sucursal: idSucursalSeguro,
      id_empresa: dataempresa?.id,
      estado: "confirmada",
      saldo: 0,
      pago_con: totalPagado,
      cantidad_productos: cantidadProductosVendidos,
      sub_total: subTotalVenta,
      vuelto: vuelto,
      monto_total: total,
      id_cierre_caja: dataCierreCaja?.id,
    };

    if (idventa === 0) {
      const result = await insertarVentas(pventas);

      for (const item of items) {
        if (result?.id > 0) {
          const detalleLimpio = {
            _id_venta: result.id,
            _cantidad: item._cantidad,
            _precio_venta: item._precio_venta,
            _total: item._total,
            _descripcion: item._descripcion,
            _id_producto: item._id_producto,
            _precio_compra: item._precio_compra,
            _id_sucursal: idSucursalSeguro,
          };

          await insertarDetalleVentas(detalleLimpio);
        }
      }

      if (result?.id > 0) {
        const pagosConMonto = Object.entries(valoresPago).filter(
          ([, monto]) => Number(monto || 0) > 0
        );

        const ventaBonificada = Number(total || 0) === 0 && pagosConMonto.length === 0;
        const metodoEfectivo = metodosCobroDisponibles.find(esMetodoEfectivo);
        const metodoTarjeta = metodosCobroDisponibles.find(esMetodoTarjeta);
        const metodoFallbackNombre = (() => {
          const tipo = normalizarMetodo(tipocobro);
          if (tipo.includes("efectivo")) return metodoEfectivo?.nombre || "Efectivo";
          if (tipo.includes("tarjeta") || tipo.includes("debito")) {
            return metodoTarjeta?.nombre || "Tarjeta";
          }
          return metodoEfectivo?.nombre || metodoTarjeta?.nombre || "Efectivo";
        })();

        const pagosARegistrar = ventaBonificada
          ? [[metodoFallbackNombre, 0]]
          : pagosConMonto;

        for (const [tipo, monto] of pagosARegistrar) {
          const tipoKey = normalizarMetodo(tipo);
          const metodoPago =
            (dataMetodosPago || []).find(
              (item) => normalizarMetodo(item?.nombre) === tipoKey
            ) ||
            (tipoKey.includes("efectivo")
              ? (dataMetodosPago || []).find(esMetodoEfectivo)
              : (dataMetodosPago || []).find(esMetodoTarjeta));

          if (!metodoPago?.id) {
            toast.error(`No se encontro el metodo de pago para "${tipo}".`);
            return { ok: false };
          }

          const pmovcaja = {
            tipo_movimiento: "ingreso",
            monto: Number(monto || 0),
            id_metodo_pago: metodoPago.id,
            descripcion: ventaBonificada
              ? `Pago de venta bonificada con ${metodoPago?.nombre || tipo}`
              : `Pago de venta con ${metodoPago?.nombre || tipo}`,
            id_usuario: datausuarios?.id,
            id_cierre_caja: dataCierreCaja?.id,
            id_ventas: result?.id,
            vuelto: esMetodoEfectivo(metodoPago) ? vuelto : 0,
          };
          await insertarMovCaja(pmovcaja);
        }
      }
    }

    return { ok: true };
  }

  useEffect(() => {
    const tipo = normalizarMetodo(tipocobro);
    if (!tipo) return;

    if (tipo.includes("mixto")) {
      setValoresPago({});
      return;
    }

    const metodoSeleccionado =
      metodosCobroDisponibles.find(
        (item) => normalizarMetodo(item?.nombre) === tipo
      ) ||
      (tipo.includes("efectivo")
        ? metodosCobroDisponibles.find(esMetodoEfectivo)
        : metodosCobroDisponibles.find(esMetodoTarjeta));

    if (!metodoSeleccionado?.nombre) return;
    setValoresPago({ [metodoSeleccionado.nombre]: Number(total || 0) });
  }, [tipocobro, total, dataMetodosPago]);

  useEffect(() => {
    calcularVueltoYRestante();
  }, [total, tipocobro, valoresPago]);

  return (
    <Container>
      {mutation.isPending ? (
        <span className="processing">Procesando venta...</span>
      ) : (
        <>
          {mutation.isError && <span className="error">Error: {mutation.error.message}</span>}

          <section className="area1">
            <span className="tipocobro">{tipocobro}</span>
            <span className="kicker">Comprobante de venta</span>
            <span className="cliente">CLIENTE GENÉRICO</span>
            <span className="meta">Caja activa</span>
          </section>

          <Linea />

          <section className="area-descuento">
            <div className="descuento-head">
              <span className="descuento-title">Descuento</span>
              <div className="descuento-switch">
                <span>$</span>
                <Switch1 state={esPorcentaje} setState={toggleTipoDescuento} />
                <span>%</span>
              </div>
            </div>
            <div className="descuento-input-wrap">
              <input
                className="descuento-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={descuento > 0 ? sanitizarEntero(descuento, limitesDescuento) : ""}
                onChange={handleDescuentoChange}
                onKeyDown={bloquearTeclasNoEnteras}
                placeholder={esPorcentaje ? "Ej: 10%" : "Ej: 500"}
              />
            </div>
          </section>

          <section className="area-descuento">
            <div className="descuento-head">
              <span className="descuento-title">Recargo</span>
              <div className="descuento-switch">
                <span>$</span>
                <Switch1 state={esPorcentajeRecargo} setState={toggleTipoRecargo} />
                <span>%</span>
              </div>
            </div>
            <div className="descuento-input-wrap">
              <input
                className="descuento-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={recargo > 0 ? sanitizarEntero(recargo, limitesRecargo) : ""}
                onChange={handleRecargoChange}
                onKeyDown={bloquearTeclasNoEnteras}
                placeholder={esPorcentajeRecargo ? "Ej: 10%" : "Ej: 500"}
              />
            </div>
          </section>

          <Linea />

          <section className="area2">
            {metodosCobroDisponibles
              .map((item, index) => {
                const tipo = normalizarMetodo(tipocobro);
                const esMixto = tipo.includes("mixto");
                const esMetodoSeleccionado =
                  normalizarMetodo(item?.nombre) === tipo;
                return esMixto || esMetodoSeleccionado ? (
                  <InputText textalign="center" key={index}>
                    <input
                      onChange={(e) => handleChangePago(item.nombre, e.target.value)}
                      value={valoresPago[item.nombre] ?? ""}
                      className="form__field"
                      type="number"
                      disabled={false}
                    />
                    <label className="form__label">{item.nombre} </label>
                  </InputText>
                ) : null;
              })}
          </section>

          <Linea />

          <section className="area3">
            {(descuento > 0 || recargo > 0) && (
              <article className="fila">
                <span className="label muted">Subtotal:</span>
                <span className="value muted strike">
                  {FormatearNumeroDinero(subtotal, dataempresa?.currency, dataempresa?.iso)}
                </span>
              </article>
            )}
            {recargoAplicado > 0 && (
              <article className="fila">
                <span className="label">Recargo:</span>
                <span className="value">
                  +{FormatearNumeroDinero(recargoAplicado, dataempresa?.currency, dataempresa?.iso)}
                </span>
              </article>
            )}
            {descuentoAplicado > 0 && (
              <article className="fila">
                <span className="label">Descuento:</span>
                <span className="value">
                  -{FormatearNumeroDinero(descuentoAplicado, dataempresa?.currency, dataempresa?.iso)}
                </span>
              </article>
            )}

            <article className="fila total-row">
              <span className="label total-label">Total a pagar:</span>
              <span className="value total-value">
                {FormatearNumeroDinero(total, dataempresa?.currency, dataempresa?.iso)}
              </span>
            </article>

            <article className="fila">
              <span className="label">Vuelto:</span>
              <span className="value">{FormatearNumeroDinero(vuelto, dataempresa?.currency, dataempresa?.iso)}</span>
            </article>

            <article className="fila">
              <span className="label">Restante:</span>
              <span className="value">{FormatearNumeroDinero(restante, dataempresa?.currency, dataempresa?.iso)}</span>
            </article>
          </section>

          <Linea />

          <section className="area4">
            <Btn1
              funcion={() => mutation.mutateAsync()}
              border="2px"
              titulo="COBRAR (Enter)"
              bgcolor="#ffbd58"
              color="#ffffff"
              width="100%"
            />
          </section>
        </>
      )}
    </Container>
  );
});

const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  width: min(100%, 420px);
  max-width: 420px;
  padding: 18px 16px 16px;
  border-radius: 18px;
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
  gap: 12px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 247, 247, 0.98)), #fff;
  color: #0d0d0d;
  min-height: auto;
  align-items: center;
  justify-content: flex-start;
  font-size: 15px;
  border: 1px solid rgba(22, 22, 22, 0.09);

  input {
    color: #111 !important;
    font-weight: 700;
  }

  &:before,
  &:after {
    content: "";
    position: absolute;
    left: 8px;
    height: 8px;
    width: calc(100% - 16px);
  }
  &:before {
    top: -7px;
    background: radial-gradient(circle, transparent, transparent 50%, #ececec 50%, #ececec 100%) -7px -8px / 16px 16px repeat-x;
  }
  &:after {
    bottom: -7px;
    background: radial-gradient(circle, transparent, transparent 50%, #ececec 50%, #ececec 100%) -7px -2px / 16px 16px repeat-x;
  }

  .processing {
    font-weight: 700;
  }

  .error {
    font-size: 13px;
    color: #b42318;
    background: #fef3f2;
    border: 1px solid #fecaca;
    width: 100%;
    padding: 8px 10px;
    border-radius: 10px;
  }

  .area1 {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2px;
    gap: 2px;

    .kicker {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #888;
      font-weight: 700;
    }

    .cliente {
      font-weight: 900;
      font-size: 21px;
      letter-spacing: 0.3px;
    }

    .meta {
      font-size: 12px;
      color: #7c7c7c;
      font-weight: 600;
    }

    .tipocobro {
      position: absolute;
      right: 10px;
      top: 10px;
      background: linear-gradient(135deg, rgba(255, 189, 89, 0.28), rgba(255, 127, 45, 0.2));
      border: 1px solid rgba(255, 167, 42, 0.45);
      padding: 4px 10px;
      color: #9a4a00;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  }

  .area-descuento {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #fafafa;
    border-radius: 12px;
    padding: 10px;

    .descuento-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .descuento-title {
      font-size: 13px;
      font-weight: 800;
      color: #1f2937;
      letter-spacing: 0.2px;
    }

    .descuento-switch {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #4b5563;
    }

    .descuento-input-wrap {
      width: 100%;
    }

    .descuento-input {
      width: 100%;
      padding: 10px;
      border-radius: 10px;
      border: 1px solid #d1d5db;
      text-align: center;
      font-weight: 800;
      font-size: 15px;
      background: #fff;
      outline: none;
    }

    .descuento-input:focus {
      border-color: #ffbd59;
      box-shadow: 0 0 0 3px rgba(255, 189, 89, 0.2);
    }
  }

  .area2 {
    width: 100%;

    input {
      font-size: clamp(22px, 5.2vw, 30px);
      text-align: center;
    }
  }

  .area3 {
    width: 100%;
    padding: 8px 2px 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .fila {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
      gap: 12px;
      font-weight: 700;
      color: #1f2937;
    }

    .label {
      text-align: left;
      min-width: 0;
    }

    .value {
      text-align: right;
      white-space: nowrap;
      min-width: 0;
    }

    .total-row {
      margin-top: 2px;
      padding-top: 2px;
      border-top: 1px solid #ececec;
      grid-template-columns: 1fr;
      align-items: stretch;
      gap: 4px;
    }

    .total-label {
      font-weight: 900;
      font-size: 20px;
      line-height: 1.1;
      color: #0f172a;
      white-space: normal;
    }

    .total-value {
      font-weight: 900;
      font-size: clamp(22px, 5.2vw, 32px);
      line-height: 1.1;
      color: #0f172a;
      width: 100%;
      text-align: right;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .muted {
      font-size: 13px;
      color: #6b7280;
      font-weight: 600;
    }

    .strike {
      text-decoration: line-through;
    }
  }

  .area4 {
    width: 100%;
    padding-top: 2px;
  }
`;

const Linea = styled.span`
  width: 100%;
  border-bottom: dashed 1px #d9d9d9;
  margin: 3px 0;
`;


