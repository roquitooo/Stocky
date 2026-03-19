import { Icon } from "@iconify/react/dist/iconify.js";
import PropTypes from "prop-types";
import { useState } from "react";
import styled from "styled-components";

export const SelectList = ({
  data, 
  placeholder, 
  onSelect, 
  displayField = "nombre",itemSelect
}) => {
  const [$isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(
    itemSelect?.[displayField] || placeholder || "Seleccionar"
  );

  const toggleDropdown = () => setIsOpen(!$isOpen);
  const handleSelect = (item) => {
     setSelected(item);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <DropdownContainer>
      <DropdownHeader onClick={toggleDropdown}>
        {itemSelect?.[displayField]}
        <Arrow $isOpen={$isOpen}><Icon icon="iconamoon:arrow-up-2-bold" width="24" height="24" /></Arrow>
      </DropdownHeader>
      {$isOpen && (
        <DropdownList>
          {data?.map((item, index) => {
            return (
              <DropdownItem
                key={index}
                onClick={() => handleSelect(item)}
                $isSelected={item === selected}
              >
                {item === selected && <CheckMark>✔</CheckMark>}
                {item?.[displayField]}
              </DropdownItem>
            );
          })}
        </DropdownList>
      )}
    </DropdownContainer>
  );
};

SelectList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  placeholder: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  displayField: PropTypes.string,
  itemSelect: PropTypes.object,
};

SelectList.defaultProps = {
  data: [],
  placeholder: "",
  displayField: "nombre",
  itemSelect: null,
};

// Estilos usando Styled Components
const DropdownContainer = styled.div`
  position: relative;
  width: ${(props) => props.width};
  min-width: 220px;
`;

const DropdownHeader = styled.div`
  background: linear-gradient(
    180deg,
    rgba(${({ theme }) => theme.bodyRgba}, 0.88) 0%,
    ${({ theme }) => theme.bg2} 100%
  );
  color: ${({ theme }) => theme.text};
  padding: 12px 15px;
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.14);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
`;

const Arrow = styled.span`
  transform: ${({ $isOpen }) => ($isOpen ? "rotate(180deg)" : "rotate(0deg)")};
  transition: transform 0.3s ease;
`;

const DropdownList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: ${({ theme }) => theme.bg2};
  border: 1px solid rgba(${({ theme }) => theme.textRgba}, 0.14);
  border-radius: 10px;
  margin-top: 5px;
  max-height: 150px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);

  // Evita que se adapte al tamaño del header
  min-width: 200px; /* Ancho mínimo */
  width: max-content; /* Ancho según el contenido */
  max-width: 300px; /* Ancho máximo */
`;

const DropdownItem = styled.div`
  padding: 10px 15px;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background-color: ${({ $isSelected }) =>
    $isSelected ? "rgba(255, 189, 88, 0.14)" : "transparent"};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 189, 88, 0.1);
  }
`;

const CheckMark = styled.span`
  color: #ffbd58;
  font-size: 14px;
`;
