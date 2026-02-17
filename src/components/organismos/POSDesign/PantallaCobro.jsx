import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useCartVentasStore } from "../../../store/CartVentasStore";
import { IngresoCobro } from "./IngresoCobro";
import { VisorTicketVenta } from "./VisorTicketVenta";

export function PantallaCobro() {
  const [stateVerticket, setStateVerticker] = useState(false);
  const { setStatePantallaCobro } = useCartVentasStore();
  const ingresoCobroRef = useRef();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (ingresoCobroRef.current) {
          ingresoCobroRef.current.mutateAsync();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Container>
      <section className="contentingresocobro">
        {stateVerticket && (
          <VisorTicketVenta setState={() => setStateVerticker(!stateVerticket)} />
        )}

        <article className="contentverticket" onClick={() => setStateVerticker(!stateVerticket)}>
          <span>{stateVerticket ? "Ocultar ticket" : "Mostrar ticket"}</span>
          {stateVerticket ? (
            <Icon className="icono" icon="ep:arrow-down-bold" />
          ) : (
            <Icon className="icono" icon="ep:arrow-up-bold" />
          )}
        </article>

        <IngresoCobro ref={ingresoCobroRef} />

        <article className="contentverticket back" onClick={setStatePantallaCobro}>
          <Icon className="icono" icon="ep:arrow-left-bold" />
          <span>Volver</span>
        </article>
      </section>
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  z-index: 100;
  background: ${({ theme }) => theme.bgtotal};

  .contentingresocobro {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 10px;
    width: min(92vw, 420px);
    min-height: 0;
    padding: 12px 0 14px;
    overflow-y: auto;

    .contentverticket {
      width: 100%;
      align-self: center;
      justify-content: center;
      cursor: pointer;
      display: flex;
      gap: 8px;
      align-items: center;
      min-height: 42px;
      border-radius: 999px;
      background: linear-gradient(135deg, rgba(255, 189, 89, 0.2), rgba(255, 189, 89, 0.08));
      border: 1px solid rgba(255, 189, 89, 0.55);
      padding: 0 14px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        background: linear-gradient(135deg, rgba(255, 189, 89, 0.26), rgba(255, 189, 89, 0.12));
      }

      span {
        font-weight: 700;
        font-size: 16px;
        color: ${({ theme }) => theme.text};
        text-transform: lowercase;
      }

      .icono {
        font-size: 20px;
        color: ${({ theme }) => theme.text};
      }
    }

    .contentverticket.back {
      width: fit-content;
      align-self: center;
      padding: 0 18px;
      margin-top: 2px;
    }
  }
`;


