import styled from "styled-components";
import { v } from "../../../styles/variables";

export const Paginacion = ({ table }) => {
  const paginaActual = table.getState().pagination.pageIndex + 1;
  const totalPaginas = Math.max(table.getPageCount(), 1);

  return (
    <Container>
      <PageButton
        type="button"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.setPageIndex(0)}
        aria-label="Ir a la primera página"
      >
        <v.iconotodos />
      </PageButton>

      <PageButton
        type="button"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
        aria-label="Página anterior"
      >
        <v.iconoflechaizquierda />
      </PageButton>

      <PageInfo>
        <strong>{paginaActual}</strong>
        <span>de {totalPaginas}</span>
      </PageInfo>

      <PageButton
        type="button"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
        aria-label="Página siguiente"
      >
        <v.iconoflechaderecha />
      </PageButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const PageButton = styled.button`
  width: 42px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid rgba(125, 74, 0, 0.35);
  border-bottom: 3px solid rgba(125, 74, 0, 0.25);
  background: linear-gradient(180deg, #f7d85d 0%, #ffbd59 100%);
  color: #2e2a1e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s linear;

  &:active {
    transform: translateY(1px);
    border-bottom-width: 1px;
  }

  &:disabled {
    background: rgba(120, 120, 120, 0.45);
    border-color: rgba(120, 120, 120, 0.5);
    border-bottom-color: rgba(120, 120, 120, 0.5);
    color: rgba(30, 30, 30, 0.55);
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 48em) {
    width: 38px;
    height: 34px;
    border-radius: 10px;
  }
`;

const PageInfo = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  color: ${({ theme }) => theme.text};
  font-weight: 700;

  strong {
    font-size: 1rem;
    line-height: 1;
  }

  span {
    font-size: 0.95rem;
    opacity: 0.9;
    line-height: 1;
  }
`;
