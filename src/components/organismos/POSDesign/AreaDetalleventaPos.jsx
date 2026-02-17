import styled from "styled-components";
import { blur_in } from "../../../styles/keyframes";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";
import {
  Btn1,
  InputText2,
  useCartVentasStore,
  useEmpresaStore,
} from "../../../index";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { Device } from "../../../styles/breakpoints";
export function AreaDetalleventaPos() {
  const {
    items,
    addcantidadItem,
    restarcantidadItem,
    removeItem,
    updateCantidadItem,
  } = useCartVentasStore();
  const { dataempresa } = useEmpresaStore();
  const [editIndex, setEditIndex] = useState(null);
  const [newCantidad, setNewCantidad] = useState(1);

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
  const handleEditClick = (index, cantidad) => {
    setEditIndex(index);
    setNewCantidad(sanitizarCantidadEntera(cantidad));
  };
  const handleInputChange = (e) => {
    setNewCantidad(sanitizarCantidadEntera(e.target.value));
  };
  const handleInputBlur = (item) => {
    const cantidadNormalizada = sanitizarCantidadEntera(newCantidad);
    updateCantidadItem(item, cantidadNormalizada);
    setEditIndex(null); // Salir del modo edicion
  };
  const handleKeyDown = (e, item) => {
    bloquearTeclasNoEnteras(e);
    if (e.key === "Enter") {
      handleInputBlur(item);
    }
  };
  return (
    <AreaDetalleventa className={items.length > 0 ? "" : "animacion"}>
      {items.length > 0 ? (
        items.map((item, index) => {
          return (
            <Itemventa key={index}>
              <article className="contentdescripcion">
                <span className="descripcion">{item._descripcion}</span>
                <span className="importe">
                  <strong>Precio Unidad:  </strong>
                  
                  {FormatearNumeroDinero(
                    item._precio_venta,
                    dataempresa?.currency,
                    dataempresa?.iso
                  )}
                </span>
              </article>
              <article className="contentbtn">
                <Btn1
                  
                  funcion={() => addcantidadItem(item)}
                  width="20px"
                  height="35px"
                  icono={<Icon icon="mdi:add-bold" />}
                ></Btn1>
                {editIndex === index ? (
                  <InputText2>
                    <input
                      type="number"
                      step="1"
                      inputMode="numeric"
                      value={newCantidad}
                      onChange={handleInputChange}
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
                      onClick={() => handleEditClick(index, item._cantidad)}
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
                <span className="cantidad">
                  <strong>
                    {FormatearNumeroDinero(
                      item._total,
                      dataempresa?.currency,
                      dataempresa?.iso
                    )}
                  </strong>
                </span>
                <span className="delete" onClick={() => removeItem(item)}>
                </span>
              </article>
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
    justify-content: center;
    text-align: end;
    margin-bottom: 10px;
    width: 100%;
    .delete {
      cursor: pointer;
      width: 20px;
      align-self: flex-end;
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
      flex-direction: column;
      justify-content: end;
      text-align: end;
      margin-bottom: 10px;
      width: 100%;
      .delete {
        cursor: pointer;
        width: 20px;
        align-self: flex-end;
      }
    }
  }
`;

