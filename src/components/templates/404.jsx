import styled from "styled-components";

export function PageNot() {
  return (
    <Wrapper>
      <Card>
        <LogoWrapper>
          <img src="Logo.svg" alt="Logo" />
        </LogoWrapper>

        <Subtitle>Página en construcción</Subtitle>
        <Title>Estamos trabajando en esta sección</Title>

        <Text>
          En breve vas a poder usar esta página.  
          Mientras tanto, podés volver al inicio.
        </Text>

        <HomeButton href="/">Volver a home</HomeButton>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #0f172a; /* fondo oscuro simple */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
`;

const Card = styled.div`
  max-width: 420px;
  width: 100%;
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem 2.25rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
  text-align: center;
`;

const LogoWrapper = styled.div`
  margin-bottom: 1.5rem;

  img {
    height: 40px;
    width: auto;
    display: block;
    margin: 0 auto;
  }
`;

const Subtitle = styled.span`
  display: block;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  font-size: 1.6rem;
  margin: 0 0 0.75rem;
  color: #111827;
`;

const Text = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  color: #4b5563;
  margin: 0 0 1.75rem;
`;

const HomeButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: #111827;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid #111827;
  transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: #000000;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.25);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;
