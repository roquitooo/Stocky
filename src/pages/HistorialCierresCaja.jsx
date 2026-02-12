import { HistorialCierresCajaTemplate } from "../components/templates/HistorialCierresCajaTemplate";
import { Navigate } from "react-router-dom";
import { useUsuariosStore } from "../store/UsuariosStore";

export function HistorialCierresCaja() {
  const { datausuarios } = useUsuariosStore();
  const esAdmin = String(datausuarios?.roles?.nombre || "")
    .toLowerCase()
    .includes("admin");

  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return <HistorialCierresCajaTemplate />;
}
