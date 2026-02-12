import styled from "styled-components";
import { Icono } from "../../index";
export function Btn1({
  funcion,
  titulo,
  bgcolor,
  icono,
  url,
  color,
  disabled,
  width,border,height,decorador,imagen
}) {
  const esBotonNuevo =
    typeof titulo === "string" && titulo.trim().toLowerCase() === "nuevo";

  return (
    <Container
      $width={width}
      disabled={disabled}
      $color={color}
      type="submit"
      $bgcolor={bgcolor}
      onClick={funcion}
      $border={border}
      $decorador={decorador}
      $height={height}
      $isNew={esBotonNuevo}
    >
      <section className="content">
        <Icono $color={color}>{icono}</Icono>
        {
          imagen && (<ContentImagen>
            <img src={imagen} />
          </ContentImagen>)
        }
        {titulo && (
          <span className="btn">
            <a href={url} target="_blank">
              {titulo}
            </a>
          </span>
        )}
      </section>
    </Container>
  );
}
const Container = styled.button`
  font-weight: 700;
  display: flex;
  font-size: 15px;
  padding: ${(props) => (props.$isNew ? "10px 18px" : "10px 25px")};
  border-radius: ${(props) => (props.$isNew ? "999px" : "16px")};
  background: ${(props) =>
    props.$isNew
      ? `linear-gradient(180deg, ${props.$bgcolor || "#ffcf79"} 0%, #ffbd59 100%)`
      : props.$bgcolor};
  border: ${(props) =>
    props.$isNew
      ? "1px solid rgba(125, 74, 0, 0.35)"
      : `${props.$border || 0} solid rgba(50, 50, 50, 0.2)`};
  border-bottom: ${(props) =>
    props.$isNew
      ? "4px solid rgba(125, 74, 0, 0.25)"
      : "5px solid rgba(50, 50, 50, 0.2)"};
  transform: translate(0, -3px);
  cursor: pointer;
  transition: 0.2s;
  transition-timing-function: linear;
  color: ${(props) => (props.$isNew ? "#2e2a1e" : props.$color)};
  align-items: center;
  justify-content: center;
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  overflow:hidden;
  
  &::before {
    content: "";
    display: ${(props) => props.$decorador};
    width: 40px;
    height: 40px;
    background-color: rgba(251, 251, 251, 0.25);
    position: absolute;
    border-radius: 50%;
    bottom: -15px;
    right: -15px;
  }

  .content {
    display: flex;
    gap: ${(props) => (props.$isNew ? "8px" : "12px")};
    align-items:center;
  }

  .btn {
    font-weight: ${(props) => (props.$isNew ? "800" : "700")};
    letter-spacing: ${(props) => (props.$isNew ? "0.2px" : "normal")};
    text-transform: ${(props) => (props.$isNew ? "capitalize" : "none")};
  }

  .content ${Icono} {
    width: ${(props) => (props.$isNew ? "18px" : "auto")};
    height: ${(props) => (props.$isNew ? "18px" : "auto")};
  }

  &:active {
    transform: translate(0, 0);
    border-bottom: ${(props) =>
      props.$isNew
        ? "1px solid rgba(125, 74, 0, 0.25)"
        : `${props.$border || 0} solid rgba(50, 50, 50, 0.2)`};
  }
  &[disabled] {
    background-color: #646464;
    cursor: no-drop;
    box-shadow: none;
  }
`;
const ContentImagen = styled.section`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  overflow: hidden;
  img{
    width:100%;
    object-fit:contain;
  }
`
