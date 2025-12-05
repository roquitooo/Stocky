import styled from "styled-components";
import {
  Header,
  Spinner1,
  useEmpresaStore,
  useUsuariosStore,
  useSucursalesStore,
} from "../index";
import { useQuery } from "@tanstack/react-query";

export function Layout({ children }) {
  const { mostrarusuarios } = useUsuariosStore();
  const { mostrarempresa } = useEmpresaStore();
  const { mostrarSucursalesAsignadas } = useSucursalesStore();

  // 1. CARGAR USUARIO
  const {
    data: datausuarios,
    isLoading: isLoadingUsuarios,
    error: errorUsuarios,
  } = useQuery({
    queryKey: ["mostrar usuarios"],
    queryFn: mostrarusuarios,
    refetchOnWindowFocus: false,
  });

  // 2. CARGAR EMPRESA (Protegido: espera al usuario)
  const {
    data: dataEmpresa,
    isLoading: isLoadingEmpresa,
    error: errorEmpresa,
  } = useQuery({
    queryKey: ["mostrar empresa", datausuarios?.id],
    queryFn: () => mostrarempresa({ _id_usuario: datausuarios?.id }),
    enabled: !!datausuarios?.id,
    refetchOnWindowFocus: false,
  });

  // 3. CARGAR SUCURSALES (Protegido: espera al usuario)
  const {
    isLoading: isLoadingSucursales,
    error: errorSucursales,
  } = useQuery({
    queryKey: ["mostrar sucursales asignadas", datausuarios?.id],
    queryFn: () => mostrarSucursalesAsignadas({ id_usuario: datausuarios?.id }),
    enabled: !!datausuarios?.id,
    refetchOnWindowFocus: false,
  });

  // Consolidamos estados de carga
  const isLoading = isLoadingUsuarios || isLoadingEmpresa || isLoadingSucursales;
  const error = errorUsuarios || errorEmpresa || errorSucursales;

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

  // Protección final: Si no hay empresa cargada, no mostramos el dashboard aún
  if (!dataEmpresa?.id) {
    return (
      <ContainerLoading>
        <Spinner1 />
      </ContainerLoading>
    );
  }

  return (
    <Container>
      {/* El Header está en una sección fija visualmente gracias al Flexbox del Container.
         No necesitas 'position: fixed' aquí si usas la estructura flex column de abajo.
      */}
      <section className="header-section">
        <Header />
      </section>

      {/* El contenido hace scroll independiente debajo del header */}
      <ContainerBody>
        {children}
      </ContainerBody>
    </Container>
  );
}

// --- ESTILOS VISUALES (LAYOUT TIPO MERCADO LIBRE) ---

const Container = styled.main`
  display: flex;
  flex-direction: column; /* Apila los elementos: Header arriba, Body abajo */
  height: 100vh;          /* Ocupa exactamente el 100% de la altura de la pantalla */
  width: 100vw;
  background-color: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  overflow: hidden;       /* IMPORTANTE: Evita que la página entera tenga scroll */
  transition: 0.1s ease-in-out;
  
  .header-section {
    flex-shrink: 0; /* Evita que el header se aplaste */
    z-index: 100;   /* Se asegura que esté por encima del contenido al hacer scroll */
  }
`;

const ContainerBody = styled.section`
  flex: 1;                /* Ocupa todo el espacio sobrante debajo del Header */
  width: 100%;
  overflow-y: auto;       /* El scroll ocurre SOLO dentro de esta sección */
  padding: 20px;
  position: relative;

  /* Estilos personalizados para el scrollbar */
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