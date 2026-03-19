import { Icon } from "@iconify/react/dist/iconify.js";
import PropTypes from "prop-types";
import styled from "styled-components";
export function BtnClose({funcion}) {
  return (
    <Container onClick={funcion}>
      <Icon icon="ep:close-bold" />
    </Container>
  );
}
BtnClose.propTypes = {
  funcion: PropTypes.func.isRequired,
};
const Container = styled.div`
position: absolute;
right:15px;
top:15px;
font-size:35px;
cursor: pointer;
color: ${({ theme }) => theme.text};
width: 42px;
height: 42px;
border-radius: 999px;
display: flex;
align-items: center;
justify-content: center;
transition: background-color 0.2s ease, transform 0.2s ease;

&:hover {
  background: rgba(${({ theme }) => theme.textRgba}, 0.08);
  transform: scale(1.03);
}
`;
