import styled from "styled-components";
import {ClimbingBoxLoader} from "react-spinners"

export function Spinner1() {

    return (<Container>
        <ClimbingBoxLoader color="#e09d21" size={40} />
        <span id="color">Esto puede tardar unos segundos...</span>
        
    </Container>);
}
const Container = styled.div`
     display: flex;
    flex-direction: column; /* Pone loader y texto uno debajo del otro */
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 70px; /* Espacio entre loader y texto */

    span#color {
        color: #e09d21;
        font-size: 30px;
    }
`