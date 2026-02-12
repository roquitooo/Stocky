import { Icon } from "@iconify/react";
import styled from "styled-components";

export const CardTotales = ({
  title,
  value,
  percentage,
  caption,
  icon,
  actionLabel,
  actionIcon,
  onAction,
}) => {
  return (
    <Container>
      <div className="top-section">
        <Title>{title}</Title>
        {icon && <Icon icon={icon} width="24" className="icon-header"/>}
      </div>
      
      {/* El title aquí ayuda a ver el número completo al pasar el mouse si se corta */}
      <ValueSection title={value}>
        {value}
      </ValueSection>

      <FooterSection>
        {percentage && (
           <span className="percent">
             {percentage > 0 ? "+" : ""}{percentage}%
           </span>
        )}
        <span className="caption">{caption}</span>
        {actionLabel && onAction && (
          <button className="action-btn" onClick={onAction} type="button">
            {actionIcon && <Icon icon={actionIcon} width="14" />}
            <span>{actionLabel}</span>
          </button>
        )}
      </FooterSection>
    </Container>
  );
};

// --- ESTILOS CORREGIDOS ---
const Container = styled.div`
  background-color: ${({ theme }) => theme.body}; 
  color: ${({ theme }) => theme.text};
  padding: 8px 20px; /* Padding equilibrado */
  border-radius: 20px;
  height: 100%;
  min-height: 150px; /* Altura mínima razonable */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: ${({ theme }) => theme.boxshadow};
  overflow: hidden; /* Evita desbordes */


  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .icon-header {
    color: ${({ theme }) => theme.text};
    opacity: 0.5;
    min-width: 24px;
  }
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text};
`;

const ValueSection = styled.div`
  /* AJUSTE CLAVE: La fuente se adapta al espacio disponible */
  font-size: clamp(20px, 2.5vw, 32px); 
  font-weight: 800;
  margin: 20px 0;
  letter-spacing: -0.5px;
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text};
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 5px;

  .percent {
    font-weight: 800;
    color: ${({ theme }) => theme.color1}; /* Color de acento del tema */
  }
  .caption {
    font-weight: 500;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
  }

  .action-btn {
    margin-top: 2px;
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: none;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    background: ${({ theme }) => theme.colorPrincipal || "#ffbd59"};
    color: #fff;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .action-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;
