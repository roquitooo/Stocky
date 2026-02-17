import styled from "styled-components";
import { LinksArray, SecondarylinksArray, ToggleTema, MenuMovil } from "../../../index";
import { v } from "../../../styles/variables";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { UserAuth } from "../../../context/AuthContent";

export function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const { cerrarSesion } = UserAuth();
  const navigate = useNavigate();

  return (
    <>
      <Container>
        <LeftSection>
          <MobileButton onClick={() => setOpenMenu(!openMenu)}>
            <Icon icon="heroicons-solid:menu" />
          </MobileButton>

          <LogoWrapper onClick={() => navigate("/")}>
            <img src={v.logo} alt="Logo" />
            <h2>STOCKY</h2>
          </LogoWrapper>
        </LeftSection>

        <CenterSection>
          <NavList>
            {LinksArray.map(({ icon, label, to }) => (
              <NavLink
                to={to}
                key={label}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                <div className="link-item">
                  <Icon className="icon" icon={icon} />
                  <span>{label}</span>
                </div>
              </NavLink>
            ))}
          </NavList>
        </CenterSection>

        <RightSection>
          <div className="desktop-actions">
            {SecondarylinksArray.map(({ icon, label, to }) => (
              <NavLink
                to={to}
                key={label}
                title={label}
                className={({ isActive }) => (isActive ? "active-icon" : "")}
              >
                <Icon icon={icon} />
              </NavLink>
            ))}
          </div>

          <Divider />

          <ThemeContainer>
            <ToggleTema />
          </ThemeContainer>

          <LogoutBtn title="Cerrar sesión" onClick={cerrarSesion}>
            <Icon icon="majesticons:door-exit" />
          </LogoutBtn>
        </RightSection>
      </Container>

      {openMenu && <MenuMovil setState={setOpenMenu} />}
    </>
  );
}

const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 70px;
  background-color: #ffbd59;
  box-shadow: 0 4px 15px -5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 900px) {
    padding: 0 12px;
    gap: 8px;
    height: 64px;
  }

  @media (max-width: 480px) {
    padding: 0 10px;
    gap: 6px;
  }
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  img {
    height: 38px;
    width: auto;
    display: block;

    @media (max-width: 600px) {
      height: 32px;
    }
  }

  h2 {
    font-size: 1.3rem;
    font-weight: 800;
    color: #2d3436;
    margin: 0;
    letter-spacing: -0.5px;

    @media (max-width: 600px) {
      display: none;
    }
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const MobileButton = styled.button`
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #2d3436;
  display: none;
  padding: 0;
  line-height: 1;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavList = styled.nav`
  display: flex;
  gap: 8px;

  a {
    text-decoration: none;
    color: #4a4a4a;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;

    .link-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
      color: #000;
    }

    &.active {
      background-color: white;
      color: #333333;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

      .icon {
        color: #333333;
      }
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 15px;
  min-width: 0;
  flex-shrink: 0;

  .desktop-actions {
    display: flex;
    align-items: center;
    gap: 12px;

    a {
      color: #4a4a4a;
      font-size: 24px;
      display: flex;
      align-items: center;
      transition: transform 0.2s;

      &:hover {
        transform: scale(1.1);
        color: #000;
      }

      &.active-icon {
        color: #fff;
      }
    }

    @media (max-width: 900px) {
      display: none;
    }
  }

  @media (max-width: 600px) {
    gap: 6px;
  }
`;

const Divider = styled.div`
  height: 24px;
  width: 1px;
  background-color: rgba(0, 0, 0, 0.15);
  margin: 0 5px;

  @media (max-width: 600px) {
    display: none;
  }
`;

const ThemeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  & > div,
  .toggle {
    margin-top: 0 !important;
  }

  transform: scale(0.9);
  transform-origin: center;

  @media (max-width: 600px) {
    transform: scale(0.72);
  }
`;

const LogoutBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 26px;
  color: #4a4a4a;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
  line-height: 1;

  &:hover {
    color: ${v.blanco};
  }

  @media (max-width: 600px) {
    font-size: 22px;
  }
`;
