import styled from "styled-components";
import {
  Checkbox1,
  ContentAccionesTabla,
  Paginacion,
  useProductosStore,
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
// Importamos Ã­conos para indicar el orden
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

// --- Componente Checkbox fuera para rendimiento ---
function IndeterminateCheckbox({ indeterminate, className = "", ...rest }) {
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
      style={{ width: "18px", height: "18px", accentColor: "#F3D20C", cursor: "pointer" }}
    />
  );
}

export function TablaProductos({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
  ocultarPrecioCompra = false,
  rowSelection,
  setRowSelection
}) {
  if (data == null) return;
  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  
  // 1. ESTADO DE ORDENAMIENTO (Por defecto: Nombre ASCendente)
  const [sorting, setSorting] = useState([{ id: "nombre", desc: false }]);
  
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
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
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
    // 3. CONFIGURAMOS LA COLUMNA NOMBRE PARA QUE SEA CLIQUEABLE
    {
      accessorKey: "nombre",
      header: ({ column }) => {
        return (
          <div 
            className="header-sortable" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
             <span>Descripción</span>
             {/* LÃ³gica para mostrar el Ã­cono correcto */}
             <span className="icon">
               {{
                 asc: <FaSortUp />,
                 desc: <FaSortDown />,
               }[column.getIsSorted()] ?? <FaSort className="icon-default"/>}
             </span>
          </div>
        )
      },
      cell: (info) => (
        <div className="ContentCell">
          <span>{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: "p_venta",
      header: "P. venta",
      cell: (info) => (
        <div className="ContentCell">
          <span>{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: "p_compra",
      header: "P. compra",
      cell: (info) => (
        <div className="ContentCell">
          <span>{info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: "sevende_por",
      header: "Se vende por",
      cell: (info) => (
        <div className="ContentCell">
          <span>{String(info.getValue() || "").toUpperCase() === "GRANEL" ? "GRAMOS" : info.getValue()}</span>
        </div>
      ),
    },
    {
      accessorKey: "maneja_inventarios",
      header: "Inv.",
      cell: (info) => (
        <div className="ContentCell">
          <Checkbox1 isChecked={info.getValue()} onChange={() => { }} />
        </div>
      ),
    },
    {
      accessorKey: "acciones",
      header: "",
      cell: (info) => (
        <div className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
            funcionEliminar={() => eliminar(info.row.original)}
          />
        </div>
      ),
    },
  ].filter((column) => !(ocultarPrecioCompra && column.accessorKey === "p_compra")), [ocultarPrecioCompra]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      rowSelection,
      sorting, // <--- Pasamos el estado
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting, // <--- Pasamos la funciÃ³n para actualizar
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(), // <--- Importante para que ordene
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
                <td 
                  key={cell.id} 
                  data-cell-id={cell.column.id}
                  data-title={
                    typeof cell.column.columnDef.header === 'string' 
                      ? cell.column.columnDef.header 
                      : cell.column.id === "nombre"
                      ? "Descripción"
                      : cell.column.id === "select"
                      ? "Seleccionar"
                      : cell.column.id === "acciones"
                      ? "Acciones"
                      : ""
                  }
                >
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
        padding: 10px;

        .header-sortable {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition: 0.2s;

          &:hover {
            opacity: 0.8;
          }

          .icon {
            display: flex;
            align-items: center;
            font-size: 12px;
          }

          .icon-default {
            opacity: 0.3;
          }
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

      .ContentCell {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        width: 100%;
      }

      td[data-cell-id="select"] .px-1 {
        display: flex;
        justify-content: flex-end;
        width: 100%;
      }

      td span {
        word-break: break-word;
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

        tr:nth-of-type(even) {
          background-color: rgba(161, 161, 161, 0.05);
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
          width: auto;
        }

        td[data-cell-id="select"] .px-1 {
          justify-content: center;
          width: auto;
        }
      }
    }
  }
`;


