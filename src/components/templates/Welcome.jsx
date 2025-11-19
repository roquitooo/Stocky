import styled from "styled-components";

export function Welcome() {
  return (
    <Wrapper>
      <Card>
        <Badge>Dashboard</Badge>

        <Title>Pantalla de Dashboard</Title>

        <Text>
          Esta sección del sistema se encuentra actualmente en construcción.
          <br />
          Próximamente vas a poder ver aquí tus métricas y accesos rápidos.
        </Text>

        <HelperText>
          Por el momento no hay acciones disponibles en esta pantalla.
        </HelperText>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${({ theme }) => theme.bgtotal || "#0f172a"};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
`;

const Card = styled.div`
  max-width: 640px;
  width: 100%;
  background: #ffffff;
  border-radius: 18px;
  padding: 2.25rem 2.5rem;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  color: #111827;
  text-align: left;
`;

const Badge = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  margin-bottom: 1.25rem;
  font-weight: 600;
`;

const Title = styled.h1`
  font-size: 1.9rem;
  margin: 0 0 0.75rem;
`;

const Text = styled.p`
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0 0 1.25rem;
`;

const HelperText = styled.p`
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0;
`;
