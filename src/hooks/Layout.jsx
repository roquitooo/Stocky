import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Header } from "../components/organismos/header/Header";
import { Spinner1 } from "../components/moleculas/Spinner1";
import { useEmpresaStore } from "../store/EmpresaStore";
import { usePermisosStore } from "../store/PermisosStore";
import { useUsuariosStore } from "../store/UsuariosStore";
import { useSucursalesStore } from "../store/SucursalesStore";
import { AlertaStock } from "../components/organismos/AlertaStock";
import { Footer } from "../components/organismos/Footer";
import { UserAuth } from "../context/AuthContent";

export function Layout({ children }) {
  const location = useLocation();
  const isConfiguracionRoot = location.pathname === "/configuracion";
  const navigate = useNavigate();
  const { cerrarSesion } = UserAuth();
  const { mostrarusuarios } = useUsuariosStore();
  const { mostrarempresa, mostrarempresaPorId } = useEmpresaStore();
  const { mostrarPermisosGlobales } = usePermisosStore();
  const { mostrarSucursalesAsignadas } = useSucursalesStore();
  const [segundosParaRedirigir, setSegundosParaRedirigir] = useState(5);

  const {
    data: datausuarios,
    isLoading: isLoadingUsuarios,
    error: errorUsuarios,
  } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: mostrarusuarios,
    refetchOnWindowFocus: false,
  });

  const {
    data: dataSucursalesAsignadas,
    isLoading: isLoadingSucursales,
    error: errorSucursales,
  } = useQuery({
    queryKey: ["mostrar sucursales asignadas", datausuarios?.id],
    queryFn: async () => {
      return await mostrarSucursalesAsignadas({ id_usuario: datausuarios?.id });
    },
    enabled: !!datausuarios?.id,
    refetchOnWindowFocus: false,
  });

  const empresaIdDesdeSucursal =
    dataSucursalesAsignadas?.[0]?.id_empresa ??
    dataSucursalesAsignadas?.[0]?.sucursales?.id_empresa ??
    dataSucursalesAsignadas?.[0]?.sucursal?.id_empresa;
  const empresaIdsAsignadas = [
    ...new Set(
      (dataSucursalesAsignadas ?? [])
        .map(
          (item) =>
            item?.id_empresa ??
            item?.sucursales?.id_empresa ??
            item?.sucursal?.id_empresa
        )
        .filter(Boolean)
    ),
  ];

  const {
    data: dataEmpresa,
    isLoading: isLoadingEmpresa,
    error: errorEmpresa,
  } = useQuery({
    queryKey: ["mostrar empresa", datausuarios?.id, empresaIdDesdeSucursal ?? null],
    queryFn: () => {
      if (empresaIdDesdeSucursal) {
        return mostrarempresaPorId({ id: empresaIdDesdeSucursal });
      }
      return mostrarempresa({ _id_usuario: datausuarios?.id });
    },
    enabled: !!datausuarios?.id,
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingPermisosGlobales,
    error: errorPermisosGlobales,
  } = useQuery({
    queryKey: ["Mostrar Permisos Globales", datausuarios?.id],
    queryFn: () => mostrarPermisosGlobales({ id_usuario: datausuarios?.id }),
    enabled: !!datausuarios?.id,
    refetchOnWindowFocus: false,
  });

  const isLoading =
    isLoadingUsuarios ||
    isLoadingEmpresa ||
    isLoadingSucursales ||
    isLoadingPermisosGlobales;
  const error =
    errorUsuarios || errorEmpresa || errorSucursales || errorPermisosGlobales;
  const sinEmpresaAsignada = !isLoading && !error && !dataEmpresa?.id;

  useEffect(() => {
    if (!sinEmpresaAsignada) {
      setSegundosParaRedirigir(5);
      return;
    }

    setSegundosParaRedirigir(5);

    const intervalId = setInterval(() => {
      setSegundosParaRedirigir((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const timeoutId = setTimeout(async () => {
      try {
        await cerrarSesion();
      } finally {
        navigate("/login", { replace: true });
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [sinEmpresaAsignada, cerrarSesion, navigate]);

  if (isLoading) {
    return (
      <ContainerLoading>
        <Spinner1 />
      </ContainerLoading>
    );
  }

  if (error) {
    return (
      <ContainerLoading>
        <span>Error cargando datos... {error.message}</span>
      </ContainerLoading>
    );
  }

  if (empresaIdsAsignadas.length > 1) {
    return (
      <ContainerLoading>
        <span>
          Tu usuario tiene sucursales asignadas en multiples empresas. Contacta
          al administrador para corregir asignaciones.
        </span>
      </ContainerLoading>
    );
  }

  // Evita spinner infinito cuando el usuario no tiene empresa vinculada.
  if (!dataEmpresa?.id) {
    return (
      <ContainerLoading>
        <ContainerMensaje>
          <span>Tu usuario no tiene empresa asignada. Contacta al administrador.</span>
          <span>Seras redirigido al login en {segundosParaRedirigir} segundos...</span>
        </ContainerMensaje>
      </ContainerLoading>
    );
  }

  return (
    <Container>
      <AlertaStock />
      <section className="header-section">
        <Header />
      </section>
      <ContainerBody $fullBleed={isConfiguracionRoot}>{children}</ContainerBody>
      {location.pathname !== "/pos" && (
        <section className="footer-section">
          <Footer />
        </section>
      )}
    </Container>
  );
}

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  min-height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  overflow: hidden;
  transition: 0.1s ease-in-out;

  .header-section {
    flex-shrink: 0;
    z-index: 100;
  }

  .footer-section {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    border-top: 1px solid rgba(145, 164, 183, 0.2);
    background-color: ${({ theme }) => theme.bgtotal};
    padding: 2px 0;
  }
`;

const ContainerBody = styled.section`
  flex: 1;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding: ${({ $fullBleed }) => ($fullBleed ? "0" : "clamp(10px, 2vw, 20px)")};
  position: relative;

  &::-webkit-scrollbar {
    width: 8px;
    background: rgba(24, 24, 24, 0.1);
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 148, 148, 0.5);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 148, 148, 0.8);
  }
`;

const ContainerLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) => theme.bgtotal};
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  color: ${({ theme }) => theme.text};
`;

const ContainerMensaje = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`;
