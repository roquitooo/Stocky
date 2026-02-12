import styled from "styled-components";
import { Device } from "../../../styles/breakpoints";
import { DateRangeFilter } from "./DateRangeFilter";

export const DashboardHeader = () => {
  return (
    <Container>
      <TextContainer>
        <Badge>Resumen</Badge>
        <Title>Dashboard</Title>
        <Subtitle>Seguimiento en tiempo real de ventas, stock y rendimiento.</Subtitle>
      </TextContainer>
      <ActionsContainer>
        <DateRangeFilter />
      </ActionsContainer>
    </Container>
  );
};
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  @media ${Device.desktop} {
    flex-direction: row;
    align-items: flex-end;
  }
`;
const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: #7d4a00;
  background: linear-gradient(180deg, #ffcf79 0%, #ffbd59 100%);
  border: 1px solid rgba(125, 74, 0, 0.25);
  border-radius: 999px;
  padding: 4px 10px;
`;
const Title = styled.h1`
  font-size: clamp(30px, 4.4vw, 44px);
  font-weight: 800;
  margin: 0;
  line-height: 1;
`;
const Subtitle = styled.p`
  margin: 0;
  font-size: clamp(13px, 1.6vw, 15px);
  opacity: 0.72;
`;
const ActionsContainer = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.03) 45%,
      rgba(0, 0, 0, 0.04)
    ),
    ${({ theme }) => theme.body};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  padding: 2px;
`;
