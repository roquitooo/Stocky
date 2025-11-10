import styled from "styled-components";
import { Btn1 } from "../../moleculas/Btn1";
import { Device } from "../../../styles/breakpoints";
import { Icon } from "@iconify/react";
export function TotalPos() {
  return (
    <Container>
      <section className="imagen">
        <img src="https://i.ibb.co/3gC2QfQ/image.png" />
      </section>
      <section className="contentTotal">
        <section className="contentTituloTotal">
          <Btn1 border="2px"  bgcolor="#ffffff"   color="#ffbd59" titulo="COBRAR" icono={<Icon icon="fluent-emoji:money-with-wings" />} />
          <Btn1 border="2px"  bgcolor="#ffbd59" titulo="..." icono={<Icon icon="fluent-emoji:safety-vest" />}/>
        </section>
        <span>$2000</span>
      </section>
    </Container>
  );
}
const Container = styled.div`
  display: flex;
  text-align: center;
  justify-content: space-between;
  border-radius: 15px;
  font-weight: 700;
  font-size: 40px;
  background-color: #ffbd59;
  padding: 10px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
  &::after {
    content: "";
    display: block;
    width: 80px;
    height: 80px;
    background-color: #ffbd59;
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
  .imagen {
    z-index: 1;
    width: 55px;
   
    position: relative;
    @media ${Device.desktop} {
      bottom: initial;
    }
    img {
      width: 100%;
    }
  }
  .contentTotal {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    .contentTituloTotal {
      display: flex;
      align-items: center;
      margin-top: 30px;
      gap: 10px;
      @media ${Device.desktop} {
        display: none;
      }
    }
  }
`;
