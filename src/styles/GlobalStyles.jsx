import {createGlobalStyle} from "styled-components"
export const GlobalStyles = createGlobalStyle`

    @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800;900&display=swap");

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: black;
    font-family: 'Poppins', sans-serif;
    color: white
  }
`;