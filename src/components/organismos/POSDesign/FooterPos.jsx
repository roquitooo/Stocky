import styled from "styled-components";
import { Device } from "../../../styles/breakpoints";
import { Btn1 } from "../../moleculas/Btn1";
import { useState } from "react";
import Swal from "sweetalert2";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { useProductosStore } from "../../../store/ProductosStore";
import { useVentasStore } from "../../../store/VentasStore";
import { useUsuariosStore } from "../../../store/UsuariosStore";
import { useMetodosPagoStore } from "../../../store/MetodosPagoStore";
import { useEmpresaStore } from "../../../store/EmpresaStore";

export function FooterPos() {
  const [isProcesandoFiado, setIsProcesandoFiado] = useState(false);
  const { resetState, items } = useCartVentasStore();
  const { descontarStockSinVenta } = useVentasStore();
  const { mostrarProductos, parametros } = useProductosStore();
  const { datausuarios } = useUsuariosStore();
  const { dataMetodosPago } = useMetodosPagoStore();
  const { dataempresa } = useEmpresaStore();
  const {
    dataCierreCaja,
    setStateIngresoSalida,
    setTipoRegistro,
    setStateCierraCaja,
  } = useCierreCajaStore();

  const handleFiadoSoloStock = async () => {
    if (isProcesandoFiado) return;

    const result = await Swal.fire({
      title: "Registrar egreso de stock?",
      text: "Esta accion no registra venta ni cobro, solo descuenta stock.",
      input: "textarea",
      inputLabel: "Descripcion del egreso de stock (opcional)",
      inputPlaceholder: "Motivo",
      inputAttributes: {
        maxlength: "240",
      },
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffbd58",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, descontar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    setIsProcesandoFiado(true);
    const descripcionFiado = String(result?.value || "").trim();
    const metodoEfectivo = (dataMetodosPago || []).find((item) =>
      String(item?.nombre || "").toLowerCase().includes("efectivo")
    );
    const operacion = await descontarStockSinVenta({
      carrito: items,
      descripcion: descripcionFiado,
      id_usuario: datausuarios?.id,
      id_cierre_caja: dataCierreCaja?.id,
      id_metodo_pago: metodoEfectivo?.id ?? null,
      id_empresa: dataempresa?.id,
    });
    setIsProcesandoFiado(false);

    if (!operacion?.ok) return;

    resetState();
    if (parametros?.id_empresa) {
      await mostrarProductos(parametros);
    }

    Swal.fire({
      icon: operacion?.fiado_registrado === false ? "warning" : "success",
      title: "Stock descontado",
      text:
        operacion?.fiado_registrado === false
          ? `Se desconto el stock, pero no se pudo guardar el egreso de stock en historial.${operacion?.error_detalle ? ` Detalle: ${operacion.error_detalle}` : ""}`
          : "Se desconto el stock y el egreso de stock quedo registrado en historial.",
      confirmButtonColor: "#ffbd58",
    });
  };

  return (
    <Footer>
      <article className="content">
        <Btn1
          bgcolor="#f44141"
          color="#fff"
          funcion={resetState}
          titulo="Eliminar venta"
        />
        <Btn1
          bgcolor="#fff"
          color="#2d2d2d"
          funcion={() => setStateCierraCaja(true)}
          titulo="Cerrar caja"
        />
        <Btn1
          bgcolor="#fff"
          color="#2d2d2d"
          funcion={() => {
            setStateIngresoSalida(true);
            setTipoRegistro("ingreso");
          }}
          titulo="Ingresar dinero"
        />
        <Btn1
          bgcolor="#fff"
          color="#2d2d2d"
          funcion={() => {
            setStateIngresoSalida(true);
            setTipoRegistro("salida");
          }}
          titulo="Retirar dinero"
        />
        <Btn1
          bgcolor="#fff"
          color="#2d2d2d"
          funcion={handleFiadoSoloStock}
          disabled={isProcesandoFiado}
          titulo={isProcesandoFiado ? "Procesando..." : "Egreso de stock"}
        />
      </article>
    </Footer>
  );
}

const Footer = styled.section`
  grid-area: footer;
  align-items: flex-start;
  display: none;
  padding-top: 4px;

  @media ${Device.desktop} {
    display: flex;
  }

  .content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
`;
