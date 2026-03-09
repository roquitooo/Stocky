import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../supabase/supabase.config";
import { useEmpresaStore } from "../../store/EmpresaStore";
import { useProductosStore } from "../../store/ProductosStore";

// Shared across component mounts to avoid duplicated alerts in bursts.
const historialGlobalAlertas = {};

export const AlertaStock = () => {
  const { setBuscador } = useProductosStore();
  const idEmpresaActiva = Number(useEmpresaStore((s) => s.dataempresa?.id) || 0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!idEmpresaActiva) return undefined;

    const channel = supabase
      .channel("almacenes-stock-alerta")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "almacenes" },
        async (payload) => {
          const stock = Number(payload?.new?.stock ?? 0);
          const stockMinimo = Number(payload?.new?.stock_minimo ?? 0);
          const idProducto = Number(payload?.new?.id_producto ?? 0);

          if (!Number.isFinite(idProducto) || idProducto <= 0) return;
          if (stock > stockMinimo) return;

          const { data: producto, error: productoError } = await supabase
            .from("productos")
            .select("nombre, id_empresa")
            .eq("id", idProducto)
            .maybeSingle();

          // Ignore alerts from other companies.
          if (productoError || !producto) return;
          if (Number(producto.id_empresa) !== idEmpresaActiva) return;

          const now = Date.now();
          const alertaKey = `${idEmpresaActiva}-${idProducto}`;
          const lastTime = historialGlobalAlertas[alertaKey] || 0;
          if (now - lastTime < 2000) return;
          historialGlobalAlertas[alertaKey] = now;

          const nombreProducto = producto?.nombre || "Producto desconocido";

          toast.warning(
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <span style={{ fontWeight: "bold" }}>Stock bajo: requiere reposicion</span>
              <span>{nombreProducto} tiene solo {stock} unidades.</span>
            </div>,
            {
              id: `alerta-stock-${alertaKey}`,
              duration: 6000,
              action: {
                label: "VER",
                onClick: () => {
                  navigate("/configuracion/productos", {
                    state: { fromStockAlert: true, search: nombreProducto },
                  });
                  setBuscador(nombreProducto);
                },
              },
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [idEmpresaActiva, navigate, setBuscador]);

  return null;
};
