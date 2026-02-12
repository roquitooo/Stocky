import { useQuery } from "@tanstack/react-query";
import {
  ProductosTemplate,
  SpinnerSecundario,
  useCategoriasStore,
  useEmpresaStore,
  useProductosStore,
  useSucursalesStore,
} from "../index";

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabase.config";

export function Productos() {
  const location = useLocation();
  const navigate = useNavigate();
  const filtroBajoStock = new URLSearchParams(location.search).get("filtro") === "bajo-stock";

  const { dataempresa } = useEmpresaStore();
  const { sucursalesItemSelect } = useSucursalesStore();
  const { mostrarProductos, buscarProductos, buscador, setBuscador } = useProductosStore();
  const { mostrarCategorias } = useCategoriasStore();
  const { mostrarSucursales } = useSucursalesStore();


 useEffect(() => {
    // ✅ si venís desde el toast, aplico el filtro
    if (location.state?.fromStockAlert && location.state?.search) {
      setBuscador(location.state.search);

      // opcional pero recomendado: limpiamos el state para que no se “re-aplique”
      navigate(location.pathname, { replace: true, state: null });
    }

    // ✅ al salir de la página, limpio el buscador para que no quede clavado
    return () => setBuscador("");
  }, []);


  // --- 1. LÓGICA DE DETECCIÓN DE SUCURSAL (CRÍTICO) ---
  const sucursalActiva = Array.isArray(sucursalesItemSelect)
    ? sucursalesItemSelect[0]
    : sucursalesItemSelect;

  // Intentamos obtener ID Sucursal, si no hay, usamos null (no undefined)
  const id_sucursal = sucursalActiva?.id || sucursalActiva?.id_sucursal || null;

  // --- 2. QUERIES CORREGIDAS ---

  // A. Mostrar Productos (Filtrados por Sucursal si existe, o Empresa si no)
  const {
    isLoading: isLoadingProductos,
    error: errorProductos,
  } = useQuery({
    queryKey: ["mostrar productos", { id_empresa: dataempresa?.id, id_sucursal, buscador }],
    queryFn: () => {
      // Si hay buscador, buscamos
      if (buscador && buscador.trim() !== "") {
        return buscarProductos({
          id_empresa: dataempresa?.id,
          buscador: buscador,
          id_sucursal: id_sucursal, // Pasamos la sucursal para ver stock real
        });
      }
      // Si no, mostramos lista normal
      return mostrarProductos({ 
        id_empresa: dataempresa?.id,
        id_sucursal: id_sucursal 
      });
    },
    enabled: !!dataempresa?.id, // Se ejecuta si hay empresa
    refetchOnWindowFocus: false,
  });

  const { data: lowStockProductIds = [], isLoading: isLoadingLowStock } = useQuery({
    queryKey: ["productos bajo stock ids", { id_sucursal, filtroBajoStock }],
    queryFn: async () => {
      if (!id_sucursal) return [];
      const { data, error } = await supabase
        .from("almacenes")
        .select("id_producto, stock, stock_minimo")
        .eq("id_sucursal", id_sucursal);

      if (error || !Array.isArray(data)) return [];

      return data
        .filter((row) => Number(row?.stock ?? 0) <= Number(row?.stock_minimo ?? 0))
        .map((row) => Number(row?.id_producto))
        .filter((id) => Number.isFinite(id));
    },
    enabled: filtroBajoStock && !!id_sucursal,
    refetchOnWindowFocus: false,
  });
  
  // B. Mostrar Sucursales (Para los selectores)
  const { isLoading: isLoadingSucursales } = useQuery({
    queryKey: ["mostrar sucursales", dataempresa?.id],
    queryFn: () => mostrarSucursales({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });
  
  // C. Mostrar Categorías
  const { isLoading: isLoadingCategorias } = useQuery({
    queryKey: ["mostrar categorias", dataempresa?.id],
    queryFn: () => mostrarCategorias({ id_empresa: dataempresa?.id }),
    enabled: !!dataempresa?.id,
    refetchOnWindowFocus: false,
  });
  
  // --- 3. GESTIÓN DE ESTADOS ---
  const isLoading =
    isLoadingProductos ||
    isLoadingSucursales ||
    isLoadingCategorias ||
    (filtroBajoStock && isLoadingLowStock);

  if (errorProductos) {
    return <span>Error cargando productos: {errorProductos.message}</span>;
  }

  // Si no hay empresa cargada aún, mostramos spinner
  if (!dataempresa?.id) {
     return <SpinnerSecundario texto="Cargando datos de empresa..." />;
  }

  return (
    <ProductosTemplate
      isLoading={isLoading}
      lowStockProductIds={lowStockProductIds}
    />
  );
} 
