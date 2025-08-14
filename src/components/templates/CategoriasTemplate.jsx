import styled from "styled-components";

export function CategoriasTemplate() {
    return (<Container>
<section className="area1">
area1
</section>
<section className="area2">
area2
</section>
<section className="main">
main
</section>
    </Container>);
}

const Container = styled.div`
    height: 100vh;
    padding: 15px;
    width: 100%;
    display: grid;
    grid-template:
    "area1" 100px
    "area2" 100px
    "main" auto;
    .area1 {
        grid-area: area1;
        background-color: rgb(206, 136, 33);
    }
    .area2 {
        grid-area: area2;
        background-color: rgb(236, 189, 119);
    }
    .main {
        grid-area: main;
        background-color: rgb(206, 136, 33);
        }
`