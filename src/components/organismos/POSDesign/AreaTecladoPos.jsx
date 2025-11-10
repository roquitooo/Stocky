import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { TotalPos } from "./TotalPos";
import { Device } from "../../../styles/breakpoints";
export function AreaTecladoPos() {
  return (
    <Container>
      <section className="areatipopago">
        <article className="box">
          <Btn1 bgcolor="#00aeff" titulo="EFECTIVO" border="0" height="70px" width="100%"/>
        </article>
        <article className="box">
          <Btn1 bgcolor="#ffbd59" width="100%" titulo="TARJETA" border="0" height="70px" />
        </article>
      </section>
      <section className="totales">
        <div className="subtotal">
            Sub total: <strong>$2000</strong>{" "}

        </div>
        <TotalPos />
      </section>
    </Container>
  );
}
const Container = styled.div`

  border: 2px solid ${({ theme }) => theme.color2};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  bottom: 10px;
  width: calc(100% - 5px);
  border-radius: 15px;
  @media ${Device.desktop} {
    position: relative;
    width: auto;
    bottom: initial;
  }
  .areatipopago {
    display: none;
    @media ${Device.desktop} {
      display: initial;
    }
    .box {
      display: flex;
      gap: 20px;
      margin: 10px;
    }
  }
  .totales{
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding:10px;
    .subtotal{
      display: none;
      flex-direction: column;
      justify-content: end;
      text-align: end;
      gap: 10px;
      font-weight: 500;
      @media ${Device.desktop} {
        display: flex;
      }
    }

  }
`;
