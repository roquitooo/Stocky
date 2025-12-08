import { useEffect } from "react";
import { supabase } from "../../supabase/supabase.config";
import { toast } from "sonner";
import { useProductosStore } from "../../store/ProductosStore";
import { useNavigate } from "react-router-dom";

// 🔴 TRUCO FINAL: Declaramos la variable AQUÍ, fuera de la función.
// Esto hace que sea compartida por todas las instancias del componente.
// No importa si tienes 1 o 10 AlertaStock, todos leerán este mismo objeto.
const historialGlobalAlertas = {}; 

export const AlertaStock = () => {
  const { setBuscador } = useProductosStore();
  const navigate = useNavigate();

  useEffect(() => {
    const channel = supabase
      .channel("almacenes-stock-alerta")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "almacenes" },
        async (payload) => {
          const { stock, stock_minimo, id_producto } = payload.new;

          if (stock <= stock_minimo) {
            
            const now = Date.now();
            // Leemos del objeto global externo
            const lastTime = historialGlobalAlertas[id_producto] || 0;

            // Si pasó menos de 2 segundos, adiós.
            if (now - lastTime < 2000) {
              return; 
            }

            // Guardamos en el objeto global
            historialGlobalAlertas[id_producto] = now;

            const toastId = `alerta-stock-${id_producto}`;

            const { data: producto } = await supabase
              .from("productos")
              .select("nombre")
              .eq("id", id_producto)
              .single();

            const nombreProducto = producto?.nombre || "Producto desconocido";

            toast.warning(
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontWeight: "bold" }}>⚠️ STOCK ⚠️ requieren reposición </span>
                <span>{nombreProducto} tiene solo {stock} unidades.</span>
              </div>,
              {
                id: toastId,
                duration: 6000,
                action: {
                  label: "VER",
                  onClick: () => {
                    setBuscador(nombreProducto);
                    navigate("/configuracion/productos");
                  },
                },
              }
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
};