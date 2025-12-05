import { NavLink, Outlet } from "react-router-dom";
import styled from "styled-components";
import { Toaster } from "sonner";

export const EmpresaTemplate = () => {
  // CONFIGURA TU WHATSAPP AQUÍ:
  const numeroWhatsapp = "+54 9 3541221140"; 
  const mensaje = "Hola, necesito ayuda con el sistema Stocky.";
  const linkWhatsapp = `https://wa.me/3541221140?text=${encodeURIComponent(mensaje)}`;

  return (
    <Main>
      <Toaster richColors position="bottom-center" />
      <PageContainer>
        {/* Contenido dinámico */}
        <ContentArea>
          <Outlet />
        </ContentArea>

        {/* Menú Lateral Derecho */}
        <AsideMenu>
          <MenuSection>
            <MenuTitle>Empresa</MenuTitle>
            <MenuItem to="empresabasicos">Básico</MenuItem>
            {/* OPCIÓN RESTAURADA */}
            <MenuItem to="monedaconfig">Moneda</MenuItem> 
          </MenuSection>

          <MenuSection>
            <MenuTitle>Soporte</MenuTitle>
            
            {/* ENLACE EXTERNO A WHATSAPP */}
            <MenuItemExternal 
              href={linkWhatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Centro de ayuda
            </MenuItemExternal>

          </MenuSection>
          
        </AsideMenu>
      </PageContainer>
    </Main>
  );
};

// --- ESTILOS ---

const Main = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  padding-bottom: 20px;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1200px;
  gap: 20px;

  @media (min-width: 768px) {
    flex-direction: row; 
    align-items: flex-start;
  }
`;

const ContentArea = styled.div`
  flex: 1; 
  background-color: ${({ theme }) => theme.bg || "transparent"};
  border-radius: 8px;
  
  @media (max-width: 768px) {
    order: 2; 
  }
`;

const AsideMenu = styled.aside`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  @media (min-width: 768px) {
    width: 260px; 
    flex-shrink: 0;
    order: 2; 
    position: sticky;
    top: 20px;
  }
`;

const MenuSection = styled.div`
  margin-bottom: 15px;
  border-radius: 12px;
  padding: 5px 0;
`;

const MenuTitle = styled.h3`
  margin: 0 0 10px 10px;
  font-size: 0.85em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.color2 || "#888"};
  letter-spacing: 1px;
  font-weight: 700;
`;

// Estilo para links internos (React Router)
const MenuItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 5px;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  color: ${(props) => props.theme.text};
  font-weight: 500;
  
  &:hover {
    background-color: ${({ theme }) => theme.bgAlpha || "rgba(0,0,0,0.05)"};
  }

  &.active {
    background: ${(props) => props.theme.bg6};
    border: 1px solid ${(props) => props.theme.bg5};
    color: ${(props) => props.theme.color1};
    font-weight: 700;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
`;

// Estilo para links externos (WhatsApp)
const MenuItemExternal = styled.a`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 5px;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  color: ${(props) => props.theme.text};
  font-weight: 500;
  
  &:hover {
    background-color: ${({ theme }) => theme.bgAlpha || "rgba(0,0,0,0.05)"};
  }
`;