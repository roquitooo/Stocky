import { HistorialFiadosCajaTemplate } from "../components/templates/HistorialFiadosCajaTemplate";
import { Navigate } from "react-router-dom";
import { useUsuariosStore } from "../store/UsuariosStore";

export function HistorialFiadosCaja() {
  const { datausuarios } = useUsuariosStore();
  const esAdmin = String(datausuarios?.roles?.nombre || "")
    .toLowerCase()
    .includes("admin");

  if (!esAdmin) {
    return <Navigate to="/" replace />;
  }

  return <HistorialFiadosCajaTemplate />;
}
