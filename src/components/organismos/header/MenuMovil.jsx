import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { Icon } from "@iconify/react";
import { LinksArray, SecondarylinksArray, ToggleTema } from "../../../index";
import { v } from "../../../styles/variables";

export const MenuMovil = ({ setState }) => {
  // Función para cerrar el menú al hacer click en un link
  const closeMenu = () => setState(false);

  return (
    <Container>
      {/* 1. SECCIÓN DE NAVEGACIÓN PRINCIPAL */}
      <NavSection>
        {LinksArray.map(({ icon, label, to }) => (
          <StyledNavLink
            key={label}
            to={to}
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <div className="icon-container">
              <Icon icon={icon} />
            </div>
            <span className="label">{label}</span>
          </StyledNavLink>
        ))}
      </NavSection>

      <Divider />

      {/* 2. SECCIÓN SECUNDARIA (Configuración, etc) */}
      <NavSection>
        {SecondarylinksArray.map(({ icon, label, to, color }) => (
          <StyledNavLink
            key={label}
            to={to}
            onClick={closeMenu}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <div className="icon-container">
              <Icon icon={icon} color={color} />
            </div>
            <span className="label">{label}</span>
          </StyledNavLink>
        ))}

        {/* 3. BOTÓN SALIR */}
        <LogoutButton onClick={closeMenu}>
          <div className="icon-container">
            <Icon icon="majesticons:door-exit" color="#ffbd59" />
          </div>
          <span className="label">SALIR</span>
        </LogoutButton>
      </NavSection>

      {/* 4. TEMA (Abajo del todo) */}
      <FooterSection>
        <ToggleTema />
      </FooterSection>
    </Container>
  );
};

// --- STYLED COMPONENTS ---

const Container = styled.div`
  background: ${({ theme }) => theme.bgtotal};
  color: ${({ theme }) => theme.text};
  position: fixed;
  top: 70px; /* Altura del Header (para no taparlo) */
  left: 0;
  z-index: 99;
  height: calc(100vh - 70px); /* El resto de la altura */
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
  transition: all 0.3s ease;
  border-top: 1px solid ${({ theme }) => theme.bg4};

  @media (max-width: 900px) {
    top: 64px;
    height: calc(100vh - 64px);
    padding: 14px;
  }

  /* Scrollbar personalizado */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colorScroll};
    border-radius: 10px;
  }
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  text-decoration: none;
  border-radius: 10px;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  text-transform: uppercase;
  transition: all 0.2s ease-in-out;

  .icon-container {
    font-size: 24px;
    display: flex;
    align-items: center;
  }

  .label {
    font-size: 0.9rem;
  }

  /* Estado Hover */
  &:hover {
    background-color: ${({ theme }) => theme.bgAlpha};
  }

  /* Estado Activo */
  &.active {
    background: ${({ theme }) => theme.bg6};
    border: 1px solid ${({ theme }) => theme.bg5};
    color: ${({ theme }) => theme.color1};
    
    .icon-container {
      color: ${({ theme }) => theme.color1};
    }
  }
`;

const LogoutButton = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  cursor: pointer;
  border-radius: 10px;
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 10px;

  &:hover {
    background-color: rgba(255, 0, 0, 0.1);
    color: ${v.rojo};
  }
  
  .icon-container {
    font-size: 24px;
    display: flex;
    align-items: center;
  }
`;

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.bg4};
  margin: 20px 0;
`;

const FooterSection = styled.div`
  margin-top: auto; /* Empuja esto al final del contenedor */
  display: flex;
  justify-content: center;
  padding-top: 20px;
  padding-bottom: 40px; /* Espacio extra para móviles con barra inferior */
`;
