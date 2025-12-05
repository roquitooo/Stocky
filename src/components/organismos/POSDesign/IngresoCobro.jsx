import styled from "styled-components";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { Icon } from "@iconify/react/dist/iconify.js";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { Switch1 } from "../../atomos/Switch1"; // Importamos el Switch
import { useClientesProveedoresStore } from "../../../store/ClientesProveedoresStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { useMovCajaStore } from "../../../store/MovCajaStore";
import { useFormattedDate } from "../../../hooks/useFormattedDate";

export const IngresoCobro = forwardRef((props, ref) => {
  const fechaActual = useFormattedDate();
  
  // TRAEMOS LOS ESTADOS NUEVOS DEL STORE (descuento, tipoDescuento, subtotal)
  const { 
      tipocobro, total, subtotal, items, 
      setStatePantallaCobro, resetState, 
      aplicarDescuento, descuento, tipoDescuento 
  } = useCartVentasStore();
  
  const [valoresPago, setValoresPago] = useState({});
  const [vuelto, setVuelto] = useState(0);
  const [restante, setRestante] = useState(0);

  // Estado local para el switch visual (true = %, false = $)
  const [esPorcentaje, setEsPorcentaje] = useState(tipoDescuento === "porcentaje");

  // Stores
  const { dataMetodosPago } = useMetodosPagoStore();
  const { datausuarios } = useUsuariosStore();
  const { sucursalesItemSelectAsignadas } = useSucursalesStore();
  const { dataempresa } = useEmpresaStore();
  const { idventa, insertarVentas, resetearventas } = useVentasStore();
  const { insertarDetalleVentas } = useDetalleVentasStore();
  const { dataCierreCaja } = useCierreCajaStore();
  const { insertarMovCaja } = useMovCajaStore();
  const { cliproItemSelect } = useClientesProveedoresStore();

  // --- LÓGICA DE DESCUENTO ---
  const handleDescuentoChange = (e) => {
    const valor = e.target.value;
    aplicarDescuento(valor, esPorcentaje ? "porcentaje" : "monto");
  };

  const toggleTipoDescuento = () => {
    const nuevoTipo = !esPorcentaje;
    setEsPorcentaje(nuevoTipo);
    aplicarDescuento(descuento, nuevoTipo ? "porcentaje" : "monto");
  };
  // ---------------------------

  const calcularVueltoYRestante = () => {
    const totalPagado = Object.values(valoresPago).reduce(
      (acc, curr) => acc + curr, 0
    );
    // Usamos 'total' que ya viene con descuento aplicado desde el store
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
    onSuccess: () => {
      if (restante > 0) return; // Pequeña corrección: si falta pagar, no cerrar
      setStatePantallaCobro({ tipocobro: "" });
      resetState();
      resetearventas();
      toast.success("Venta generada!");
    },
  });

  async function insertarventas() {
    if (restante <= 0) { // Aceptamos 0 o negativo (vuelto)
      const pventas = {
        fecha: fechaActual,
        id_cliente: cliproItemSelect?.id,
        id_usuario: datausuarios?.id,
        id_sucursal: sucursalesItemSelectAsignadas?.id_sucursal,
        id_empresa: dataempresa?.id,
        estado: "confirmada",
        vuelto: vuelto,
        monto_total: total, // Guardamos el total final con descuento
        id_cierre_caja: dataCierreCaja?.id,
      };
      
      if (idventa === 0) {
        const result = await insertarVentas(pventas);
        
        // Guardamos detalles
        for (const item of items) {
             if (result?.id > 0) {
                item._id_venta = result?.id;
                await insertarDetalleVentas(item);
             }
        }

        // Guardamos movimientos de caja
        if (result?.id > 0) {
          for (const [tipo, monto] of Object.entries(valoresPago)) {
            if (monto > 0) {
              const metodoPago = dataMetodosPago.find(
                (item) => item.nombre === tipo
              );
              const pmovcaja = {
                tipo_movimiento: "ingreso",
                monto: monto,
                id_metodo_pago: metodoPago?.id,
                descripcion: `Pago de venta con ${tipo}`,
                id_usuario: datausuarios?.id,
                id_cierre_caja: dataCierreCaja?.id,
                id_ventas: result?.id,
                vuelto: tipo === "Efectivo" ? vuelto : 0,
              };
              await insertarMovCaja(pmovcaja);
            }
          }
        }
      }
    } else {
      toast.warning("Falta completar el pago");
    }
  }

  useEffect(() => {
    // Si no es mixto, autocompletar con el total final
    if (tipocobro !== "Mixto" && valoresPago[tipocobro] != total) {
      setValoresPago((prev) => ({
        ...prev,
        [tipocobro]: total,
      }));
    }
  }, [tipocobro, total]);

  useEffect(() => {
    calcularVueltoYRestante();
  }, [total, tipocobro, valoresPago]);

  return (
    <Container>
      {mutation.isPending ? (
        <span>Procesando venta...</span>
      ) : (
        <>
          {mutation.isError && <span>Error: {mutation.error.message}</span>}
          
          <section className="area1">
            <span className="tipocobro">{tipocobro}</span>
            {/* Cliente Fijo */}
            <span className="cliente" style={{fontWeight: "800", fontSize: "18px", marginTop:"5px"}}>
              CLIENTE GENERICO
            </span>
          </section>

          <Linea />
          
          {/* --- SECCIÓN DESCUENTO NUEVA --- */}
          <section className="area-descuento" style={{width:"100%", marginBottom:"10px"}}>
             <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px", padding:"0 10px"}}>
                 <span style={{fontSize:"14px", fontWeight:"bold"}}>Descuento:</span>
                 <div style={{display:"flex", alignItems:"center", gap:"5px", fontSize:"12px"}}>
                    <span>$</span>
                    <Switch1 state={esPorcentaje} setState={toggleTipoDescuento} />
                    <span>%</span>
                 </div>
             </div>
             <div style={{padding:"0 10px"}}>
                 <input 
                    style={{
                        width: "100%", 
                        padding: "8px", 
                        borderRadius: "8px", 
                        border: "1px solid #ccc",
                        textAlign: "center",
                        fontWeight: "bold"
                    }}
                    type="number"
                    value={descuento > 0 ? descuento : ""}
                    onChange={handleDescuentoChange}
                    placeholder={esPorcentaje ? "Ej: 10%" : "Ej: $500"}
                 />
             </div>
          </section>
          {/* ----------------------------- */}

          <Linea />

          <section className="area2">
            {dataMetodosPago
              ?.filter((item) => item.nombre === "Efectivo" || item.nombre === "Tarjeta")
              .map((item, index) => {
              return (tipocobro === "Mixto" && item.nombre !== "Mixto") ||
                (tipocobro === item.nombre && item.nombre !== "Mixto") ? (
                <InputText textalign="center" key={index}>
                  <input
                    onChange={(e) =>
                      handleChangePago(item.nombre, e.target.value)
                    }
                    // El input se llena con el total final (ya con descuento)
                    defaultValue={tipocobro === item.nombre ? total : ""}
                    className="form__field"
                    type="number"
                    disabled={
                      tipocobro === "Mixto" || tipocobro === "Efectivo"
                        ? false
                        : true
                    }
                  />
                  <label className="form__label">{item.nombre} </label>
                </InputText>
              ) : null;
            })}
          </section>

          <Linea />

          <section className="area3">
            <article className="etiquetas">
              {/* Mostramos el Subtotal real si hay descuento */}
              {descuento > 0 && <span style={{fontSize:"14px", color:"#888"}}>Subtotal: </span>}
              <span className="total">Total a Pagar: </span>
              <span>Vuelto: </span>
              <span>Restante: </span>
            </article>
            
            <article>
              {/* Valor Subtotal */}
              {descuento > 0 && (
                 <span style={{fontSize:"14px", color:"#888", textDecoration:"line-through"}}>
                   {FormatearNumeroDinero(subtotal, dataempresa?.currency, dataempresa?.iso)}
                 </span>
              )}

              {/* Valor Total Final */}
              <span className="total">
                {FormatearNumeroDinero(total, dataempresa?.currency, dataempresa?.iso)}
              </span>
              
              <span>
                {FormatearNumeroDinero(vuelto, dataempresa?.currency, dataempresa?.iso)}
              </span>
              <span>
                {FormatearNumeroDinero(restante, dataempresa?.currency, dataempresa?.iso)}
              </span>
            </article>
          </section>

          <Linea />

          <section className="area4">
            <Btn1
              funcion={() => mutation.mutateAsync()}
              border="2px"
              titulo="COBRAR (enter)"
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

// --- ESTILOS ---
const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  width: 400px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 15px 0px #e2e2e2;
  gap: 10px; /* Reducido un poco para que quepa todo */
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  color: #000;
  min-height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 20px; /* Ajustado tamaño fuente base */

  input {
    color: #000 !important;
    font-weight: 700;
  }
  /* ... (estilos de before/after ticket se mantienen) ... */
  &:before, &:after { content: ""; position: absolute; left: 5px; height: 6px; width: 380px; }
  &:before { top: -5px; background: radial-gradient(circle, transparent, transparent 50%, #fbfbfb 50%, #fbfbfb 100%) -7px -8px / 16px 16px repeat-x; }
  &:after { bottom: -5px; background: radial-gradient(circle, transparent, transparent 50%, #fbfbfb 50%, #fbfbfb 100%) -7px -2px / 16px 16px repeat-x; }

  .area1 {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 5px;
    .tipocobro {
      position: absolute; right: 6px; top: 6px; background-color: rgba(233, 6, 184, 0.2); padding: 5px; color: #e61eb1; border-radius: 5px; font-size: 15px; font-weight: 650;
    }
  }
  .area2 {
    input { font-size: 32px; } /* Un poco más chico para que no se corte */
  }
  .area3 {
    display: flex; justify-content: space-between; width: 100%;
    article { display: flex; flex-direction: column; }
    .total { font-weight: 800; font-size: 24px; color: #000; }
    .etiquetas { text-align: end; margin-right: 10px; }
  }
`;

const Linea = styled.span`
  width: 100%;
  border-bottom: dashed 1px #d4d4d4;
  margin: 5px 0;
`;