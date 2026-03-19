import PropTypes from "prop-types";
import styled from 'styled-components';

export const Check = ({ checked, onChange }) => {
  return (
    <Container>
      <Input type="checkbox" checked={checked} onChange={onChange} />
      <Checkmark />
    </Container>
  );
};

Check.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

const Container = styled.label`
  --input-focus: #ffbd58;
  --input-out-of-focus: ${({ theme }) => theme.bg4};
  --bg-color: ${({ theme }) => theme.body};
  --main-color: ${({ theme }) => theme.color2};
  position: relative;
  cursor: pointer;
`;

const Input = styled.input`
  position: absolute;
  opacity: 0;
`;

const Checkmark = styled.div`
  width: 30px;
  height: 30px;
  position: relative;
  top: 0;
  left: 0;
  border: 2px solid var(--main-color);
  border-radius: 8px;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18);
  background-color: var(--input-out-of-focus);
  transition: all 0.3s;

  ${Input}:checked ~ & {
    background-color: var(--input-focus);
    border-color: #f0c74a;
    box-shadow: 0 0 0 4px rgba(255, 189, 88, 0.18);
  }

  &:after {
    content: "";
    width: 7px;
    height: 15px;
    position: absolute;
    top: 2px;
    left: 8px;
    display: none;
    border: solid var(--bg-color);
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(45deg);
  }

  ${Input}:checked ~ &:after {
    display: block;
  }
`;
