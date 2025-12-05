import styled from "styled-components";
import {
  Checkbox1,
  ContentAccionesTabla,
  Paginacion,
  useProductosStore,
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState, useEffect, useMemo, useRef } from "react"; // 1. IMPORTAR useRef
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";

export function TablaProductos({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
  rowSelection,
  setRowSelection
}) {
  if (data == null) return;
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const { eliminarProductos } = useProductosStore();

  function eliminar(p) {
    if (p.nombre === "General") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Este registro no se permite modificar ya que es valor por defecto.",
      });
      return;
    }
    Swal.fire({
      title: "¿Estás seguro/a?",
      text: "Una vez eliminado, ¡no podrá recuperar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ffbd58",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarProductos({ id: p.id });
      }
    });
  }

  function editar(data) {
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  // --- COMPONENTE CHECKBOX NATIVO CORREGIDO ---
  function IndeterminateCheckbox({ indeterminate, className = "", ...rest }) {
    // 2. USO DE useRef (CORRECCIÓN DEL ERROR ROJO)
    const ref = useRef(null); 

    useEffect(() => {
      if (typeof indeterminate === "boolean" && ref.current) {
        ref.current.indeterminate = !rest.checked && indeterminate;
      }
    }, [ref, indeterminate]);

    return (
      <input
        type="checkbox"
        ref={ref}
        className={className}
        {...rest}
        style={{width:"18px", height:"18px", accentColor:"#F3D20C", cursor:"pointer"}}
      />
    );
  }

  const columns = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <div className="px-1">
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler(),
            }}
          />
        </div>
      ),
    },
    {
      accessorKey: "nombre",
      header: "Descripcion",
      cell: (info) => (
        <td data-title="DESCRIPCION" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
    },
    {
      accessorKey: "p_venta",
      header: "P. venta",
      cell: (info) => (
        <td data-title="P. venta" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
    },
    {
      accessorKey: "p_compra",
      header: "P. compra",
      cell: (info) => (
        <td data-title="P. compra" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
    },
    {
      accessorKey: "sevende_por",
      header: "Se vende por",
      cell: (info) => (
        <td data-title="Se vende por" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
    },
    {
      accessorKey: "maneja_inventarios",
      header: "Inv.",
      cell: (info) => (
        <td data-title="Inventarios" className="ContentCell">
          {/* 3. CORRECCIÓN ERROR AMARILLO: Agregamos onChange vacío para evitar warning de read-only */}
          <Checkbox1 isChecked={info.getValue()} onChange={()=>{}} />
        </td>
      ),
    },
    {
      accessorKey: "acciones",
      header: "",
      cell: (info) => (
        <div data-title="Acciones" className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
            funcionEliminar={() => eliminar(info.row.original)}
          />
        </div>
      ),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <Container>
      <table className="responsive-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : (
                    <>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion
        table={table}
        irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex + 1}
        setPagina={setPagina}
        maximo={table.getPageCount()}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin: 5% 3%;
  @media (min-width: ${v.bpbart}) {
    margin: 2%;
  }
  @media (min-width: ${v.bphomer}) {
    margin: 2em auto;
  }
  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    font-size: 0.9em;
    thead {
      position: absolute;
      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
      @media (min-width: ${v.bpbart}) {
        position: relative;
        height: auto;
        width: auto;
        overflow: auto;
      }
      th {
        border-bottom: 2px solid ${({ theme }) => theme.color2};
        font-weight: 700;
        text-align: center;
        color: ${({ theme }) => theme.text};
        padding: 10px;
        &:first-of-type {
          text-align: center;
        }
      }
    }
    tbody,
    tr,
    th,
    td {
      display: block;
      padding: 0;
      text-align: left;
      white-space: normal;
    }
    tr {
      @media (min-width: ${v.bpbart}) {
        display: table-row;
      }
    }
    th,
    td {
      padding: 0.5em;
      vertical-align: middle;
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.5em;
      }
    }
    tbody {
      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
      }
      tr {
        margin-bottom: 1em;
        @media (min-width: ${v.bpbart}) {
          display: table-row;
          border-width: 1px;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
        &:nth-of-type(even) {
          background-color: rgba(161, 161, 161, 0.05);
        }
      }
      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        @media (min-width: ${v.bpbart}) {
          justify-content: center;
          border-bottom: none;
        }
      }
      td {
        text-align: right;
        @media (min-width: ${v.bpbart}) {
          text-align: center;
        }
      }
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.8em;
        font-weight: 700;
        @media (min-width: ${v.bpbart}) {
          content: none;
        }
      }
    }
  }
`;