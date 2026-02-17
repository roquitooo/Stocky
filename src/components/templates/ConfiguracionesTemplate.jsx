import styled from "styled-components";
import fondocuadros from "../../assets/Logofondo.svg";
import { Link } from "react-router-dom";
import { usePermisosStore } from "../../index";

export function ConfiguracionesTemplate() {
  const { dataPermisosConfiguracion } = usePermisosStore();

  return (
    <Container>
      <BackdropLogo aria-hidden="true" />

      <Content>
        <Header>
          <h1>Configuración</h1>
          <p>Administra los módulos principales de tu negocio.</p>
        </Header>

        <CardsGrid>
          {(dataPermisosConfiguracion || []).map((item, index) => {
            const modulo = item?.modulos || {};
            const habilitado = modulo?.state !== false;

            return (
              <CardLink
                key={`${modulo?.id || modulo?.nombre || "mod"}-${index}`}
                to={modulo?.link || "#"}
                className={habilitado ? "" : "disabled"}
                aria-disabled={!habilitado}
                onClick={(e) => {
                  if (!habilitado) e.preventDefault();
                }}
              >
                <article className="card-content">
                  <div className="icon-wrap">
                    <img src={modulo?.icono} alt={modulo?.nombre || "Módulo"} />
                  </div>

                  <div className="text-wrap">
                    <h3>{modulo?.nombre || "Módulo"}</h3>
                    <p>{modulo?.descripcion || "Sin descripción"}</p>
                  </div>
                </article>
              </CardLink>
            );
          })}
        </CardsGrid>
      </Content>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: clamp(14px, 2.5vw, 30px);
  background:
    linear-gradient(
      120deg,
      rgba(255, 189, 89, 0.2) 0%,
      rgba(255, 189, 89, 0.1) 40%,
      rgba(255, 255, 255, 0.04) 100%
    ),
    ${({ theme }) => theme.bgtotal};
  overflow: hidden;
  overflow-x: clip;
`;

const BackdropLogo = styled.div`
  position: absolute;
  inset: 0;
  background-image: url(${fondocuadros});
  background-repeat: no-repeat;
  background-position: center;
  background-size: min(110vw, 1100px);
  opacity: 0.2;
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: 980px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.header`
  h1 {
    margin: 0;
    font-size: clamp(1.45rem, 2.1vw, 2rem);
    font-weight: 800;
    color: ${({ theme }) => theme.text};
    letter-spacing: 0.2px;
  }

  p {
    margin: 6px 0 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colortitlecard || theme.text};
    opacity: 0.75;
  }
`;

const CardsGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(12px, 2vw, 18px);

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: linear-gradient(
      160deg,
      rgba(255, 255, 255, 0.06),
      rgba(255, 255, 255, 0.02) 48%,
      rgba(0, 0, 0, 0.05)
    ),
    ${({ theme }) => theme.bgcards};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 189, 89, 0.78);
    box-shadow: 0 14px 38px rgba(0, 0, 0, 0.25);
  }

  .card-content {
    min-height: 190px;
    padding: 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 18px;
  }

  .icon-wrap {
    width: 68px;
    height: 68px;
    border-radius: 14px;
    background: rgba(255, 189, 89, 0.14);
    border: 1px solid rgba(255, 189, 89, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 38px;
      height: 38px;
      object-fit: contain;
      filter: grayscale(100%);
      transition: filter 0.2s ease;
    }
  }

  .text-wrap {
    h3 {
      margin: 0;
      font-size: 1.34rem;
      font-weight: 800;
      color: ${({ theme }) => theme.colorsubtitlecard};
      line-height: 1.15;
    }

    p {
      margin: 8px 0 0;
      font-size: 0.92rem;
      font-weight: 500;
      color: ${({ theme }) => theme.colortitlecard};
      opacity: 0.9;
    }
  }

  &:hover .icon-wrap img {
    filter: grayscale(0%);
  }

  &.disabled {
    opacity: 0.45;
    pointer-events: none;
  }
`;


