import { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useCierreCajaStore } from "../../../store/CierreCajaStore";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react/dist/iconify.js";

export function MenuFlotante() {
  const [isOpen, setIsOpen] = useState(false);
  const { setStateIngresoSalida, setTipoRegistro, setStateCierraCaja } =
    useCierreCajaStore();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Container>
      {/* CORRECCIÓN 1: Usamos la variable 'isOpen' (sin $) como valor */}
      <MenuItems $isOpen={isOpen}>
        <MenuItem
          $isOpen={isOpen} // <--- Corregido
          delay="0s"
          onClick={() => {
            toggleMenu();
            setStateIngresoSalida(true);
            setTipoRegistro("ingreso");
          }}
        >
          <Icon icon="noto:money-with-wings" />
          <Text>Ingresar dinero</Text>
        </MenuItem>
        
        <MenuItem
          $isOpen={isOpen} // <--- Corregido
          delay="0.1s"
          onClick={() => {
            toggleMenu();
            setStateIngresoSalida(true);
            setTipoRegistro("salida");
          }}
        >
          <Text>Retirar dinero</Text>
        </MenuItem>
        
        <MenuItem
          $isOpen={isOpen} // <--- Corregido
          delay="0.2s"
          onClick={() => {
            toggleMenu();
            setStateCierraCaja(true);
          }}
        >
          <Text>Cerrar caja</Text>
        </MenuItem>

        <MenuItem $isOpen={isOpen} delay="0.4s"> {/* <--- Corregido */}
          <Text>Ver ventas del día</Text>
        </MenuItem>
        
        <MenuItem 
          $isOpen={isOpen} // <--- Corregido
          delay="0.3s" 
          onClick={toggleMenu}
        >
          <Text>Eliminar venta</Text>
        </MenuItem>
      </MenuItems>
      
      <FloatingButton onClick={toggleMenu}>
        <Icon icon="mdi:menu-up-outline" fontSize={50} />
      </FloatingButton>
    </Container>
  );
}

// Styled Components y animaciones

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Container = styled.div`
  position: fixed;
  bottom: 100px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  @media ${Device.desktop} {
    display: none;
  }
`;

const FloatingButton = styled.button`
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease-in-out;
 
  &:hover {
    transform: rotate(90deg);
  }
`;

const MenuItems = styled.div`
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  
  /* CORRECCIÓN 2: Leemos $isOpen en lugar de isOpen */
  ${({ $isOpen }) => !$isOpen && "display: none;"}
`;

const MenuItem = styled.div`
  background-color: #ffffff;
  border: none;
  border-radius: 50px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  opacity: 0;
  
  /* CORRECCIÓN 2: Leemos $isOpen en lugar de isOpen */
  animation: ${({ $isOpen }) => ($isOpen ? slideUp : "none")} 0.4s ease forwards;
  animation-delay: ${({ delay }) => delay};

  &:hover {
    background-color: #c7c7c7;
  }
`;

const Text = styled.span`
  font-size: 16px;
  color: #000;
`;