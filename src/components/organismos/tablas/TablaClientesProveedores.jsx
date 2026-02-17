import styled from "styled-components";
import {
  ContentAccionesTabla,
  useCategoriasStore,
  Paginacion,ImagenContent, Icono,
  useClientesProveedoresStore
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV } from "react-icons/fa";
export function TablaClientesProveedores({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data==null) return;
  const [pagina, setPagina] = useState(1);
  const [datas, setData] = useState(data);
  const [columnFilters, setColumnFilters] = useState([]);

  const { eliminarCliPro } = useClientesProveedoresStore();
  function eliminar(p) {
    if (p.nombre === "General") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Este registro no se permite modificar ya que es valor por defecto.",
        footer: '<a href="">...</a>',
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
      confirmButtonText: "Sí, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarCliPro({ id: p.id });
      }
    });
  }
  function editar(data) {
    if (data.nombre === "General") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Este registro no se permite modificar ya que es valor por defecto.",
        footer: '<a href="">...</a>',
      });
      return;
    }
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }
  const columns = [
  
   
    {
      accessorKey: "nombres",
      header: "Descripción",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "direccion",
      header: "Dirección",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },

    {
      accessorKey: "identificador_nacional",
      header: "Id nacional",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
   {
      accessorKey: "identificador_fiscal",
      header: "Id fiscal",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },

    {
      accessorKey: "acciones",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <div className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
            funcionEliminar={() => eliminar(info.row.original)}
          />
        </div>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
  ];
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                  ...prev[rowIndex],
                  [columnId]: value,
                }
              : row
          )
        ),
    },
  });
  return (
    <>
      <Container>
        <table className="responsive-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.column.columnDef.header}
                    {header.column.getCanSort() && (
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <FaArrowsAltV />
                      </span>
                    )}
                    {
                      {
                        asc: " ▲",
                        desc: " ▼",
                      }[header.column.getIsSorted()]
                    }
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${
                        header.column.getIsResizing() ? "isResizing" : ""
                      }`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(item=>(
              
                <tr key={item.id}>
                  {item.getVisibleCells().map(cell => (
                  
                      <td
                        key={cell.id}
                        data-cell-id={cell.column.id}
                        data-title={
                          typeof cell.column.columnDef.header === "string" &&
                          cell.column.columnDef.header.trim() !== ""
                            ? cell.column.columnDef.header
                            : cell.column.id === "acciones"
                            ? "Acciones"
                            : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
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
    </>
  );
}
const Container = styled.div`
  position: relative;
  margin: 8px 0 0;

  .responsive-table {
    width: 100%;
    margin-bottom: 1rem;
    border-spacing: 0;
    border-collapse: separate;

    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }

    @media (min-width: ${v.bpmarge}) {
      font-size: 1em;
    }

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

    th,
    td {
      padding: 0.5em;
      vertical-align: middle;

      @media (min-width: ${v.bplisa}) {
        padding: 0.75em 0.5em;
      }

      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.5em;
      }

      @media (min-width: ${v.bpmarge}) {
        padding: 0.75em 0.5em;
      }

      @media (min-width: ${v.bphomer}) {
        padding: 0.75em;
      }
    }

    @media (min-width: ${v.bpbart}) {
      thead {
        display: table-header-group;
      }

      tbody {
        display: table-row-group;
      }

      tr {
        display: table-row;
      }
    }

    tbody {
      tr {
        margin-bottom: 0.85rem;
        border: 1px solid rgba(161, 161, 161, 0.32);
        border-radius: 14px;
        background-color: ${({ theme }) => theme.bg2};
        overflow: hidden;
      }

      tr:last-of-type {
        margin-bottom: 0.5rem;
      }

      td {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        text-align: left;
        border-bottom: 1px solid rgba(161, 161, 161, 0.22);
      }

      td:last-child {
        border-bottom: none;
      }

      td[data-title]:before {
        content: attr(data-title);
        font-size: 0.86em;
        font-weight: 600;
        color: ${({ theme }) => theme.text};
        opacity: 0.85;
        flex-shrink: 0;
      }

      td[data-cell-id="nombres"] span,
      td[data-cell-id="direccion"] span,
      td[data-cell-id="identificador_nacional"] span,
      td[data-cell-id="identificador_fiscal"] span,
      td[data-cell-id="estado"] span {
        word-break: break-word;
      }

      td[data-cell-id="acciones"] .ContentCell {
        justify-content: flex-end;
      }

      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 10px;
        width: 100%;
        min-height: 38px;
        border-bottom: none;
      }

      @media (min-width: ${v.bpbart}) {
        display: table-row-group;

        tr {
          display: table-row;
          margin-bottom: 0;
          border: none;
          border-radius: 0;
          background-color: transparent;
        }

        td {
          display: table-cell;
          text-align: center;
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        }

        td[data-title]:before {
          content: none;
        }

        .ContentCell {
          justify-content: center;
          min-height: 50px;
          width: auto;
        }
      }
    }
  }
`;

