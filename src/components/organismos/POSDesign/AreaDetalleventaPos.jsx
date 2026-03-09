import styled from "styled-components";
import { blur_in } from "../../../styles/keyframes";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import {
  Btn1,
  InputText2,
  useCartVentasStore,
  useEmpresaStore,
  useProductosStore,
} from "../../../index";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useMemo, useState } from "react";
import { Device } from "../../../styles/breakpoints";
import { Switch1 } from "../../atomos/Switch1";
export function AreaDetalleventaPos() {
  const {
    items,
    addcantidadItem,
    restarcantidadItem,
    removeItem,
    updateCantidadItem,
    updateAjusteItem,
    syncStockData,
  } = useCartVentasStore();
  const { dataProductos } = useProductosStore();
  const { dataempresa } = useEmpresaStore();
  const [editItemId, setEditItemId] = useState(null);
  const [newCantidad, setNewCantidad] = useState("1");
  const [ajusteItemId, setAjusteItemId] = useState(null);
  const [ajusteValorInput, setAjusteValorInput] = useState("");
  const [ajusteEsRecargo, setAjusteEsRecargo] = useState(true);
  const [ajusteEsPorcentaje, setAjusteEsPorcentaje] = useState(true);

  const itemsVista = useMemo(() => [...(items || [])].reverse(), [items]);

  const sanitizarCantidadEntera = (value) => {
    const soloDigitos = String(value ?? "").replace(/\D/g, "");
    const cantidad = Number.parseInt(soloDigitos, 10);
    if (Number.isNaN(cantidad) || cantidad <= 0) return 1;
    return cantidad;
  };

  const bloquearTeclasNoEnteras = (e) => {
    if ([".", ",", "e", "E", "-", "+"].includes(e.key)) {
      e.preventDefault();
    }
  };
  const handleEditClick = (item, cantidad) => {
    setEditItemId(item?._id_producto);
    setNewCantidad(String(sanitizarCantidadEntera(cantidad)));
  };
  const handleInputChange = (e) => {
    const soloDigitos = String(e.target.value ?? "").replace(/\D/g, "");
    setNewCantidad(soloDigitos);
  };
  const handleInputBlur = (item) => {
    const cantidadNormalizada = sanitizarCantidadEntera(newCantidad);
    updateCantidadItem(item, cantidadNormalizada);
    setNewCantidad("1");
    setEditItemId(null); // Salir del modo edicion
  };
  const handleKeyDown = (e, item) => {
    bloquearTeclasNoEnteras(e);
    if (e.key === "Enter") {
      handleInputBlur(item);
    }
  };

  const sanitizarAjusteEntero = (value, { maxDigitos, maxValor } = {}) => {
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

  const limitesAjuste = {
    maxDigitos: ajusteEsPorcentaje ? 3 : 10,
    maxValor: ajusteEsPorcentaje ? 100 : undefined,
  };

  const handleAjusteInputChange = (e) => {
    setAjusteValorInput(sanitizarAjusteEntero(e.target.value, limitesAjuste));
  };

  const handleToggleAjusteModo = () => {
    const nuevoEsPorcentaje = !ajusteEsPorcentaje;
    setAjusteEsPorcentaje(nuevoEsPorcentaje);
    setAjusteValorInput(
      sanitizarAjusteEntero(ajusteValorInput, {
        maxDigitos: nuevoEsPorcentaje ? 3 : 10,
        maxValor: nuevoEsPorcentaje ? 100 : undefined,
      })
    );
  };

  const abrirEditorAjuste = (item) => {
    const valor = Number(item?._ajuste_valor || 0);
    const tipo = valor > 0 ? item?._ajuste_tipo || "recargo" : "recargo";
    const modo = valor > 0 ? item?._ajuste_modo || "porcentaje" : "porcentaje";

    setAjusteItemId(item?._id_producto);
    setAjusteEsRecargo(tipo === "recargo");
    setAjusteEsPorcentaje(modo === "porcentaje");
    setAjusteValorInput(
      valor > 0
        ? sanitizarAjusteEntero(valor, {
            maxDigitos: modo === "porcentaje" ? 3 : 10,
            maxValor: modo === "porcentaje" ? 100 : undefined,
          })
        : ""
    );
  };

  const aplicarAjuste = (item) => {
    const valorSanitizado = sanitizarAjusteEntero(ajusteValorInput, limitesAjuste);
    updateAjusteItem(item, {
      tipo: ajusteEsRecargo ? "recargo" : "descuento",
      modo: ajusteEsPorcentaje ? "porcentaje" : "monto",
      valor: valorSanitizado === "" ? 0 : Number(valorSanitizado),
    });
    setAjusteItemId(null);
  };

  const limpiarAjuste = (item) => {
    updateAjusteItem(item, {
      tipo: "recargo",
      modo: "porcentaje",
      valor: 0,
    });
    setAjusteItemId(null);
  };

  const formatearResumenAjuste = (item) => {
    const valor = Number(item?._ajuste_valor || 0);
    if (!Number.isFinite(valor) || valor <= 0) return null;
    const prefijo = item?._ajuste_tipo === "recargo" ? "+" : "-";
    const sufijo = item?._ajuste_modo === "porcentaje" ? "%" : "";
    return `${prefijo}${valor}${sufijo}`;
  };

  const formatearStock = (valor) => {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "-";
    const stock = Number.isInteger(numero) ? numero : Number(numero.toFixed(2));
    return stock.toLocaleString("es-AR");
  };

  useEffect(() => {
    if (!items?.length) return;
    syncStockData(dataProductos);
  }, [items?.length, dataProductos, syncStockData]);

  return (
    <AreaDetalleventa className={items.length > 0 ? "" : "animacion"}>
      {items.length > 0 ? (
        itemsVista.map((item, index) => {
          const resumenAjuste = formatearResumenAjuste(item);
          const manejaInventario =
            item?.maneja_inventarios === true ||
            String(item?.maneja_inventarios).toLowerCase() === "true";
          const stockNumero = Number(item?.stock);
          const stockMinimo = Number(
            item?.stock_minimo ?? item?._stock_minimo ?? item?.stockminimo ?? 0
          );
          const sinStock = manejaInventario && Number.isFinite(stockNumero) && stockNumero <= 0;
          const bajoStock =
            !sinStock &&
            manejaInventario &&
            Number.isFinite(stockNumero) &&
            Number.isFinite(stockMinimo) &&
            stockMinimo > 0 &&
            stockNumero <= stockMinimo;
          const stockTexto = manejaInventario
            ? formatearStock(item?.stock)
            : "Sin control";
          return (
            <Itemventa key={item?._id_producto ?? `${item?._descripcion}-${index}`}>
              <article className="contentdescripcion">
                <span className="descripcion">{item._descripcion}</span>
                <span className="importe">
                  <strong>Precio Unidad:  </strong>

                  {FormatearNumeroDinero(
                    item._precio_venta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                  <span
                    className={`stock-tag ${
                      sinStock ? "sin-stock" : bajoStock ? "bajo-stock" : "con-stock"
                    }`}
                  >
                    Stock: {stockTexto}
                  </span>
                </span>
              </article>
              <article className="contentbtn">
                <Btn1
                  funcion={() => addcantidadItem(item)}
                  width="20px"
                  height="35px"
                  icono={<Icon icon="mdi:add-bold" />}
                ></Btn1>
                {editItemId === item?._id_producto ? (
                  <InputText2>
                    <input
                      type="number"
                      step="1"
                      inputMode="numeric"
                      autoFocus
                      value={newCantidad}
                      onChange={handleInputChange}
                      onFocus={(e) => e.currentTarget.select()}
                      onBlur={() => handleInputBlur(item)}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      className="form__field"
                      min="1"
                    />
                  </InputText2>
                ) : (
                  <>
                    <span className="cantidad">{item._cantidad}</span>
                    <Icon
                      icon="mdi:pencil"
                      onClick={() => handleEditClick(item, item._cantidad)}
                      className="edit-icon"
                    />
                  </>
                )}

                <Btn1
                  funcion={() => restarcantidadItem(item)}
                  width="20px"
                  height="35px"
                  icono={<Icon icon="subway:subtraction-1" />}
                ></Btn1>
              </article>
              <article className="contentTotaldetalleventa">
                {resumenAjuste && (
                  <span
                    className={`ajuste-tag ${
                      item?._ajuste_tipo === "recargo" ? "recargo" : "descuento"
                    }`}
                  >
                    {resumenAjuste}
                  </span>
                )}
                <span className="cantidad">
                  <strong>
                    {FormatearNumeroDinero(
                      item._total,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </strong>
                </span>
                <button
                  type="button"
                  className="adjust-toggle"
                  onClick={() => abrirEditorAjuste(item)}
                  aria-label="Configurar recargo o descuento"
                  title="Recargo / Descuento"
                >
                  <Icon icon="mdi:percent-outline" />
                </button>
                <button
                  type="button"
                  className="delete"
                  onClick={() => removeItem(item)}
                  aria-label="Eliminar producto del carrito"
                  title="Eliminar producto"
                >
                  <Icon icon="gravity-ui:trash-bin" />
                </button>
              </article>
              {ajusteItemId === item?._id_producto && (
                <article className="ajuste-panel">
                  <section className="fila-switch">
                    <span>Desc.</span>
                    <Switch1 state={ajusteEsRecargo} setState={() => setAjusteEsRecargo((prev) => !prev)} />
                    <span>Rec.</span>
                  </section>
                  <section className="fila-switch">
                    <span>$</span>
                    <Switch1
                      state={ajusteEsPorcentaje}
                      setState={handleToggleAjusteModo}
                    />
                    <span>%</span>
                  </section>
                  <input
                    className="ajuste-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ajusteValorInput}
                    onChange={handleAjusteInputChange}
                    onKeyDown={bloquearTeclasNoEnteras}
                    onFocus={(e) => e.currentTarget.select()}
                    placeholder={ajusteEsPorcentaje ? "Ej: 10" : "Ej: 1500"}
                  />
                  <section className="ajuste-actions">
                    <button type="button" className="btn btn-clear" onClick={() => limpiarAjuste(item)}>
                      Limpiar
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancel"
                      onClick={() => setAjusteItemId(null)}
                    >
                      Cancelar
                    </button>
                    <button type="button" className="btn btn-apply" onClick={() => aplicarAjuste(item)}>
                      Aplicar
                    </button>
                  </section>
                </article>
              )}
            </Itemventa>
          );
        })
      ) : (
        <></>
      )}
    </AreaDetalleventa>
  );
}

const AreaDetalleventa = styled.section`
  display: flex;
  width: 100%;
  margin-top: 6px;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &.animacion {
    flex: 0 0 auto;
    height: auto;
    min-height: 0;
    justify-content: flex-start;
  }
`;
const Itemventa = styled.section`
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px dashed ${({ theme }) => theme.color2};
  animation: ${blur_in} 0.2s linear both;
  flex-direction: column;
  gap: 10px;
  .contentdescripcion {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    .descripcion {
      font-weight: 700;
      font-size: 20px;
    }
    .importe {
      font-size: 15px;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      .stock-tag {
        font-size: 12px;
        font-weight: 700;
        border: 1px solid ${({ theme }) => theme.color2};
        border-radius: 999px;
        padding: 2px 8px;
        &.con-stock {
          color: #22c55e;
          border-color: rgba(34, 197, 94, 0.55);
          background: rgba(34, 197, 94, 0.12);
        }
        &.sin-stock {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.55);
          background: rgba(239, 68, 68, 0.12);
        }
        &.bajo-stock {
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.55);
          background: rgba(245, 158, 11, 0.14);
        }
      }
    }
  }
  .contentbtn {
    display: flex;
    width: 100%;
    height: 100%;
    gap: 10px;
    align-items: center;
    justify-content: center;
    .cantidad {
      font-size: 1.8rem;
      font-weight: 700;
    }
    .edit-icon {
      cursor: pointer;
      font-size: 18px;
    }
  }
  .contentTotaldetalleventa {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    text-align: end;
    margin-bottom: 10px;
    width: 100%;
    .ajuste-tag {
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid;
      &.recargo {
        color: #0b7a3e;
        border-color: #0b7a3e;
      }
      &.descuento {
        color: #b42318;
        border-color: #b42318;
      }
    }
    .adjust-toggle {
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #ffbd59;
      font-size: 22px;
      padding: 0;
    }
    .delete {
      cursor: pointer;
      width: 30px;
      height: 30px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      color: #ff0000ff;
      font-size: 22px;
      padding: 0;
    }
  }
  .ajuste-panel {
    width: 100%;
    border: 1px solid ${({ theme }) => theme.color2};
    border-radius: 12px;
    padding: 10px;
    margin-bottom: 10px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, auto)) minmax(110px, 1fr);
    gap: 10px;
    align-items: center;

    .fila-switch {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
    }

    .ajuste-input {
      width: 100%;
      border: 1px solid ${({ theme }) => theme.color2};
      border-radius: 8px;
      padding: 8px;
      font-weight: 700;
      text-align: center;
    }

    .ajuste-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .btn {
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-clear {
      background-color: #f4f4f5;
      color: #2d2d2d;
    }

    .btn-cancel {
      background-color: #f1f5f9;
      color: #1f2937;
    }

    .btn-apply {
      background-color: #ffbd59;
      color: #fff;
    }
  }
  @media ${Device.tablet} {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    .contentdescripcion {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      .descripcion {
        font-weight: 700;
        font-size: 20px;
      }
      .importe {
        font-size: 15px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        .stock-tag {
          font-size: 12px;
          font-weight: 700;
          border: 1px solid ${({ theme }) => theme.color2};
          border-radius: 999px;
          padding: 2px 8px;
          &.con-stock {
            color: #22c55e;
            border-color: rgba(34, 197, 94, 0.55);
            background: rgba(34, 197, 94, 0.12);
          }
          &.sin-stock {
            color: #ef4444;
            border-color: rgba(239, 68, 68, 0.55);
            background: rgba(239, 68, 68, 0.12);
          }
          &.bajo-stock {
            color: #f59e0b;
            border-color: rgba(245, 158, 11, 0.55);
            background: rgba(245, 158, 11, 0.14);
          }
        }
      }
    }
    .contentbtn {
      display: flex;
      width: 100%;
      height: 100%;
      gap: 10px;
      align-items: center;
      justify-content: center;
      .cantidad {
        font-size: 1.8rem;
        font-weight: 700;
      }
      .edit-icon {
        cursor: pointer;
        font-size: 18px;
      }
    }
    .contentTotaldetalleventa {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      text-align: end;
      margin-bottom: 10px;
      width: 100%;
      .ajuste-tag {
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid;
        &.recargo {
          color: #0b7a3e;
          border-color: #0b7a3e;
        }
        &.descuento {
          color: #b42318;
          border-color: #b42318;
        }
      }
      .adjust-toggle {
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: #ffbd59;
        font-size: 22px;
        padding: 0;
      }
      .delete {
        cursor: pointer;
        width: 30px;
        height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: transparent;
        color: #ff0000ff;
        font-size: 22px;
        padding: 0;
      }
    }
    .ajuste-panel {
      width: 100%;
      border: 1px solid ${({ theme }) => theme.color2};
      border-radius: 12px;
      padding: 10px;
      margin-bottom: 10px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, auto)) minmax(110px, 1fr);
      gap: 10px;
      align-items: center;

      .fila-switch {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 700;
      }

      .ajuste-input {
        width: 100%;
        border: 1px solid ${({ theme }) => theme.color2};
        border-radius: 8px;
        padding: 8px;
        font-weight: 700;
        text-align: center;
      }

      .ajuste-actions {
        grid-column: 1 / -1;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .btn {
        border: none;
        border-radius: 8px;
        padding: 6px 10px;
        font-weight: 700;
        cursor: pointer;
      }

      .btn-clear {
        background-color: #f4f4f5;
        color: #2d2d2d;
      }

      .btn-cancel {
        background-color: #f1f5f9;
        color: #1f2937;
      }

      .btn-apply {
        background-color: #ffbd59;
        color: #fff;
      }
    }
  }
`;
