import styled from "styled-components";
import {
  Header,
  Spinner1,
  useEmpresaStore,
  useUsuariosStore,
  useSucursalesStore,
} from "../index";
import { useQuery } from "@tanstack/react-query";
// 1. IMPORTAMOS EL COMPONENTE DE ALERTA
import { AlertaStock } from "../components/organismos/AlertaStock"; 


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

  // Protección final
  if (!dataEmpresa?.id) {
    return (
      <ContainerLoading>
        <Spinner1 />
      </ContainerLoading>
    );
  }

  

  return (
    <Container>
      <AlertaStock />
      <section className="header-section">
        <Header />
      </section>
      <ContainerBody>
        {children}
      </ContainerBody>
    </Container>
  );
}

// --- ESTILOS VISUALES (LAYOUT TIPO MERCADO LIBRE) ---

const Container = styled.main`
  display: flex;
  flex-direction: column; 
  height: 100vh;         
  width: 100vw;
  background-color: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  overflow: hidden;      
  transition: 0.1s ease-in-out;
  
  .header-section {
    flex-shrink: 0; 
    z-index: 100;   
  }
`;

const ContainerBody = styled.section`
  flex: 1;                
  width: 100%;
  overflow-y: auto;      
  padding: 20px;
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