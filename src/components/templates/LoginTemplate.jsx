import styled from "styled-components";
import {Btnsave, InputText2, Title} from "../../index"
import { Linea } from "../atomos/Linea";
import {v} from "../../styles/variables";
import { FcGoogle } from "react-icons/fc";
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
            <Btnsave titulo="INGRESAR" 
            bgcolor="#ffc400"
            color="1,1,1"
            width="100%"/>

            </InputText2>
        </form>
        <Linea>
          <span>0</span>  
        </Linea>
        <Btnsave titulo="Google" bgcolor="#fff" icono={<v.iconogoogle/>} />
        
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