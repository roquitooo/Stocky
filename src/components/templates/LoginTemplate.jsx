import styled from "styled-components";
import {Btnsave, InputText2, Title} from "../../index"
import { Linea } from "../atomos/Linea";
import {v} from "../../styles/variables";
import { Device } from "../../styles/breakpoints";
import logo from "../../assets/logo.svg";
export function LoginTemplate() {
    return (<Container>
    <div className="card">
        <img className="logo" src={logo} alt="Logo Stocky" height="100px"/>
        <Title> BIENVENIDO A STOCKY </Title>
        <form>
            <InputText2>
            <input className="form__field" 
            placeholder="Email" type ="text"/>
            </InputText2>

            <InputText2>
            <input className="form__field" 
            placeholder="Contraseña" type ="password"/>
            </InputText2>

        <Btnsave titulo="INGRESAR" 
            bgcolor="#ffc400"
            color="1,1,1"
            width="100%"/>

        </form>
        <Linea>
          <span>0</span>  
        </Linea>

        <Btnsave titulo="Google" bgcolor="#fff" icono={<v.iconogoogle/>} />
        
    </div>
    </Container>);
}
const Container = styled.div`
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    .card {
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        width: 100%;
        margin: 20px;
        @media ${Device.tablet} {
            width: 400px;
        }

    }
`