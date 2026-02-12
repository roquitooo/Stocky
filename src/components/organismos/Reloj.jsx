import { useEffect, useState } from "react";
import styled from "styled-components";

export function Reloj() {
  const [horaPrincipal, setHoraPrincipal] = useState("");
  const [segundos, setSegundos] = useState("");
  const [fechaCorta, setFechaCorta] = useState("");

  useEffect(() => {
    const actualizarReloj = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");

      const dias = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
      const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

      setHoraPrincipal(`${hh}:${mm}`);
      setSegundos(`:${ss}`);
      setFechaCorta(
        `${dias[now.getDay()]} ${String(now.getDate()).padStart(2, "0")} ${meses[now.getMonth()]} ${now.getFullYear()}`
      );
    };

    actualizarReloj();
    const intervalId = setInterval(actualizarReloj, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Container>
      <div className="clock-wrap">
        <div className="time-row">
          <div className="time-main">{horaPrincipal}</div>
          <span className="chip chip-seconds">{segundos}</span>
        </div>
        <div className="chips">
          <span className="chip">{fechaCorta}</span>
        </div>
      </div>
    </Container>
  );
}

const Container = styled.div`
  width: 160px;
  max-width: 160px;

  .clock-wrap {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 14px;
    background:
      linear-gradient(${({ theme }) => theme.body}, ${({ theme }) => theme.body}) padding-box,
      linear-gradient(135deg, #ffbd59 0%, #f48c06 100%) border-box;
    border: 1px solid transparent;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  .time-main {
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: clamp(1.1rem, 1.6vw, 1.5rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.04em;
  }

  .time-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .chips {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .chip {
    font-size: 0.64rem;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 8px;
    border: 1px solid rgba(255, 189, 89, 0.35);
    background: rgba(255, 189, 89, 0.1);
    color: ${({ theme }) => theme.text};
    opacity: 0.95;
  }

  .chip-seconds {
    min-width: 36px;
    text-align: center;
  }
`;
