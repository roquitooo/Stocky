import styled from "styled-components";
import {InputText2, Title} from "../../index"
export function LoginTemplate() {
    return (<Container>
<section className="contentCard">
    <div className="card">
        <Title>Ingresar</Title>
        <form>
            <InputText2>
            <input className="form__field" 
            placeholder="Email" type ="text"/>


            </InputText2>
            <InputText2>
            <input className="form__field" 
            placeholder="Contraseña" type ="password"/>


            </InputText2>
        </form>

    </div>
</section>
    </Container>);
}
const Container = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    
`