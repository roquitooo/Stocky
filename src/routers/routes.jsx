import { Routes, Route, Navigate } from "react-router-dom";
import {
  Categorias,
  Configuraciones,
  Login,
  Productos,
  ProtectedRoute,
  POS,
  Layout, // <--- IMPORTANTE: Usamos el Layout que ya arreglamos
  PageNot,
  Empresa,
  ClientesProveedores,
} from "../index";
import { BasicosConfig } from "../components/organismos/EmpresaConfigDesign/BasicosConfig";
import { MonedaConfig } from "../components/organismos/EmpresaConfigDesign/MonedaConfig";
import { MetodosPago } from "../pages/MetodosPago";
import { Dashboard } from "../pages/Dashboard";
import {Usuarios} from "../pages/Usuarios"
import { HistorialCierresCaja } from "../pages/HistorialCierresCaja";
import { HistorialFiadosCaja } from "../pages/HistorialFiadosCaja";


export function MyRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <ProtectedRoute accessBy="non-authenticated">
            <Login />
          </ProtectedRoute>
        }
      />

      {/* RUTAS PROTEGIDAS (Envueltas en el Layout que carga los datos) */}
      <Route
        path="/"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
            
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
            
              <Configuraciones />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion/categorias"
        element={
          <Layout>
          <ProtectedRoute accessBy="authenticated">
            
              <Categorias />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion/productos"
        element={
          <Layout>
          <ProtectedRoute accessBy="authenticated">
            
              <Productos />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion/empresa"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
              <Empresa />
            </ProtectedRoute>
          </Layout>
        }
      >
        <Route index element={<Navigate to="empresabasicos" />} />
        <Route path="empresabasicos" element={<BasicosConfig />} />
        <Route path="monedaconfig" element={<MonedaConfig />} />
      </Route>
      <Route
        path="/pos"
        element={
          <Layout>
          <ProtectedRoute accessBy="authenticated">
              <POS />
          </ProtectedRoute>
          </Layout>
        }
      />
      
      <Route
        path="/configuracion/clientes"
        element={
          <Layout>
          <ProtectedRoute accessBy="authenticated">
              <ClientesProveedores />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion/proveedores"
        element={
           <Layout>
            <ProtectedRoute accessBy="authenticated">
              <ClientesProveedores />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion/empresa"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
              <Empresa />
            </ProtectedRoute>
          </Layout>
        }
      >
        
      </Route>
      <Route
        path="/configuracion/metodospago"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
            
              <MetodosPago />
            </ProtectedRoute>
          </Layout>
        }
      />
      <Route
        path="/configuracion/usuarios"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
              <Usuarios />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route
        path="/dashboard/cierres-caja"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
              <HistorialCierresCaja />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route
        path="/dashboard/egresos-stock-caja"
        element={
          <Layout>
            <ProtectedRoute accessBy="authenticated">
              <HistorialFiadosCaja />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route path="/dashboard/fiados-caja" element={<Navigate to="/dashboard/egresos-stock-caja" replace />} />
      
      <Route path="*" element={<PageNot />} />
      
    </Routes>

  );
}
