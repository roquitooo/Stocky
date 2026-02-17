import styled from "styled-components";
import { useCartVentasStore, useEmpresaStore } from "../../..";
import { FormatearNumeroDinero } from "../../../utils/Conversiones";

export function TotalPos() {
  const { total } = useCartVentasStore();
  const { dataempresa } = useEmpresaStore();

  return (
    <Container>
      <section className="contentTotal">
        <span>
          {FormatearNumeroDinero(
            total,
            dataempresa?.currency,
            dataempresa?.iso
          )}
        </span>
      </section>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  border-radius: 15px;
  font-weight: 700;
  font-size: 38px;
  background-color: #ffbd59;
  padding: 10px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  height: 100%;

  &::after {
    content: "";
    display: block;
    width: 100px;
    height: 100px;
    background-color: rgba(255, 255, 255, 0.2);
    position: absolute;
    border-radius: 50%;
    top: -20px;
    left: -15px;
  }
  &::before {
    content: "";
    display: block;
    width: 20px;
    height: 20px;
    background-color: ${({ theme }) => theme.bgtotal};
    position: absolute;
    border-radius: 50%;
    top: 5px;
    right: 5px;
  }

  .contentTotal {
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
`;
