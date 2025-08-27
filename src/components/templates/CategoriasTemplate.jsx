import styled from "styled-components";
import { Btn1, Buscador, TablaCategorias, Title, useCategoriasStore } from "../../index";
import { v } from "../../styles/variables";
export function CategoriasTemplate() {
    const {datacategorias} = useCategoriasStore()

    return (<Container>
<section className="area1"><Title>Categorias</Title>
<Btn1 bgcolor={v.colorPrincipal} titulo="nuevo" icono={<v.iconoagregar/>}/>
</section>

<section className="area2">
<Buscador/>
</section>

<section className="main"><TablaCategorias data={datacategorias}/></section>
    </Container>);
}

const Container = styled.div`
    height: calc(100vh - 30px);
    padding: 15px;
    display: grid;
    grid-template:
    "area1" 60px
    "area2" 60px
    "main" auto;
    .area1 {
        grid-area: area1;
        background-color: rgb(206, 136, 33);
        display: flex;
        justify-content: end;
        align-items: center;
        gap: 15px;
        padding: 0 15px;
    }
    .area2 {
        grid-area: area2;
        background-color: rgb(236, 184, 105);
        display: flex;
        justify-content: end;
        align-items: center;
    }

    .main {
        grid-area: main;
        background-color: rgb(146, 96, 21);
        }
`