import {GlobalStyles, MyRoutes} from "./index"
import styled from "styled-components";
import {Device} from "./styles/breakpoints";

function App() {

  return (
    <Container>
      <GlobalStyles />
      <section className="contentSidebar">sidebar</section>
      <section className="contentMenuambur">menuambur</section>
      <section className="contentRouters"><MyRoutes/></section>

    </Container>
  );
}
const Container = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  background-color: black;
  .contentSidebar{
    display: none;
    background-color: rgba(247, 181, 0, 0.5);
  }
  .contentMenuambur{
    position: absolute;
    background-color: rgba(55, 0, 255, 0.5);
  }
  .contentRouters{
    background-color: rgba(255, 0, 200, 0.5);
    grid-column: 1;
    width: 100%;

  }
  @media ${Device.tablet} {
    grid-template-columns: 88px 1 fr;
    .contentSidebar{
      display: initial;
    }
      .contentMenuambur{
        display: none;
      }
      .contentRouters{
        grid-column: 2;

      }
    }
`;

export default App;
