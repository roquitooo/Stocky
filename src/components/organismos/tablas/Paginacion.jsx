import React, { useState } from "react";
import { v } from "../../../styles/variables";
import styled from "styled-components";
import { Btn1 } from "../../../index";
export const Paginacion = ({ table }) => {


  return (
    <Container >
   
      <Btn1 disabled={!table.getCanPreviousPage()} funcion={() => table.setPageIndex(0)} bgcolor="#ffbd59" icono={<v.iconotodos />} />

      <Btn1  disabled={!table.getCanPreviousPage()} funcion={() => table.previousPage()} bgcolor="#ffbd59" icono={<v.iconoflechaizquierda />} />


    
      <span>{table.getState().pagination.pageIndex + 1}</span>
      <p> de {table.getPageCount()} </p>

      <Btn1  disabled={!table.getCanNextPage()} funcion={() => table.nextPage()} bgcolor="#ffbd59" icono={<v.iconoflechaderecha />} />
      
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  color: #9c9c9c

 
`;