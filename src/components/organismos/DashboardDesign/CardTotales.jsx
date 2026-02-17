import { Icon } from "@iconify/react";
import styled from "styled-components";

export const CardTotales = ({
  title,
  value,
  secondaryValue,
  secondaryCaption,
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
        {icon && <Icon icon={icon} width="24" className="icon-header" />}
      </div>

      <ValueSection title={value}>{value}</ValueSection>

      {secondaryValue && (
        <SecondaryValueSection title={secondaryValue}>
          <span className="secondary-value">{secondaryValue}</span>
          {secondaryCaption && (
            <span className="secondary-caption">{secondaryCaption}</span>
          )}
        </SecondaryValueSection>
      )}

      <FooterSection>
        {percentage && (
          <span className="percent">
            {percentage > 0 ? "+" : ""}
            {percentage}%
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

const Container = styled.div`
  background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.07),
      rgba(255, 255, 255, 0.03) 45%,
      rgba(0, 0, 0, 0.04)
    ),
    ${({ theme }) => theme.body};
  color: ${({ theme }) => theme.text};
  padding: 10px 20px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  height: 100%;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 10px 14px;
    min-height: 130px;
  }

  .top-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
  }

  .icon-header {
    color: ${({ theme }) => theme.text};
    opacity: 0.75;
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
  font-size: clamp(20px, 2.5vw, 32px);
  font-weight: 800;
  margin: 20px 0;
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.text};

  @media (max-width: 768px) {
    margin: 14px 0;
    font-size: clamp(16px, 7vw, 26px);
  }
`;

const SecondaryValueSection = styled.div`
  margin-top: -12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;

  .secondary-value {
    font-size: clamp(12px, 1.3vw, 14px);
    font-weight: 700;
    opacity: 0.95;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .secondary-caption {
    font-size: 10px;
    font-weight: 600;
    opacity: 0.6;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  gap: 5px;

  .percent {
    font-weight: 800;
    color: ${({ theme }) => theme.color1};
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

  @media (max-width: 768px) {
    .caption {
      white-space: normal;
    }
  }

  .action-btn:hover {
    opacity: 0.92;
    transform: translateY(-1px);
  }
`;
