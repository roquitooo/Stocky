import { Navigate, useLocation } from "react-router-dom";
import { UserAuth } from "../context/AuthContent";
import { usePermisosStore } from "../store/PermisosStore";

export const ProtectedRoute = ({ children, accessBy }) => {
  const { user } = UserAuth();
  const { dataPermisosGlobales, permisosGlobalesLoaded } = usePermisosStore();
  const location = useLocation();

  const publicPaths = ["/login", "/404", "/no-autorizado"];

  // ✅ Si estoy en una ruta pública, no valido permisos
  if (publicPaths.includes(location.pathname)) {
    // si es login y ya hay user, lo mando al home
    if (location.pathname === "/login" && user) {
      return <Navigate to="/" replace />;
    }
    return children;
  }

  // ✅ Non-authenticated: solo entra si NO hay usuario
  if (accessBy === "non-authenticated") {
    return !user ? children : <Navigate to="/" replace />;
  }

  // ✅ Authenticated
  if (accessBy === "authenticated") {
    if (!user) 
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;

    // ✅ Si todavía no cargaron permisos, NO redirijas (evita loop/falsos negativos)
    if (!permisosGlobalesLoaded) {
      return <div style={{ padding: 16 }}>Cargando permisos...</div>;
    }

    const permisos = dataPermisosGlobales ?? [];
    const hasPermission = permisos.some((item) => {
      const link = item?.modulos?.link;
      if (!link) return false;
      if (link === location.pathname) return true;
      if (link === "/" && location.pathname.startsWith("/dashboard/")) return true;
      return false;
    });

    console.log("state permiso:", hasPermission);
    console.log("state path:", location.pathname);

    if (!hasPermission) {
      return <Navigate to="/no-autorizado" replace />;
    }

    return children;
  }

  // fallback
  return <Navigate to="/login" replace />;
};

