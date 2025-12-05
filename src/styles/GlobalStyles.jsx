import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
    body {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        background-color: ${({ theme }) => theme.bgtotal};
        font-family: "Poppins", sans-serif;
        color: #fff;
        overflow: hidden; /* <--- AGREGAR ESTO: Para que el scroll lo maneje el Layout */
    }
    
    /* El resto de tus estilos de scrollbar están perfectos, se aplicarán al ContainerBody */
    ::-webkit-scrollbar {
      width: 12px;
      background: rgba(24, 24, 24, 0.2);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(148, 148, 148, 0.9);
      border-radius: 10px;
      filter: blur(10px);
    }
`;