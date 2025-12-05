import styled from "styled-components";
import { useForm } from "react-hook-form";
import { Btn1, InputText2 } from "../../../index";
import { useProductosStore } from "../../../store/ProductosStore";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function AumentarPrecio({ onClose, selectedIds, setIsExploding }) {
  const { aumentarPrecioSeleccion } = useProductosStore();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { isPending, mutate } = useMutation({
    mutationFn: async (data) => {
      const p = {
        ids: selectedIds, 
        porcentaje: parseFloat(data.porcentaje)
      };
      
      // --- AQUÍ ESTABA EL ERROR ---
      // Antes solo hacías un log. Ahora llamamos a la función real:
      return await aumentarPrecioSeleccion(p);
    },
    onSuccess: (exito) => {
      if(exito) {
        toast.success(`Precios actualizados en ${selectedIds.length} productos`);
        // Invalidamos para que la tabla se refresque con los nuevos precios
        queryClient.invalidateQueries(["mostrar productos"]); 
        if(setIsExploding) setIsExploding(true); 
        onClose();
      } else {
        toast.error("Error en la base de datos. Revisa la consola.");
      }
    },
    onError: (err) => {
      toast.error("Error crítico: " + err.message);
    }
  });

  const onSubmit = (data) => {
    mutate(data);
  };

  return (
    <Container>
      <div className="sub-contenedor">
        <div className="headers">
          <section>
            <h1>Aumentar Precio</h1>
            <p className="subtitle">Se aplicará a {selectedIds.length} productos seleccionados</p>
          </section>
          <section>
            <span onClick={onClose} className="close-btn">x</span>
          </section>
        </div>

        {/* 1. Ponemos el evento en el formulario */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="form-subcontainer">
            <label>Porcentaje de aumento (%)</label>
            <InputText2>
              <input
                className="form__field"
                type="number"
                step="0.01"
                placeholder="Ej: 10 (para 10%)"
                autoFocus
                {...register("porcentaje", { required: true, min: 0.01 })}
              />
            </InputText2>
            {errors.porcentaje && <p className="error">Ingrese un porcentaje válido</p>}

            <div className="footer-btn">
              {/* 2. El botón queda limpio, actuando como submit nativo */}
              <Btn1 
                titulo={isPending ? "Aplicando..." : "Aplicar Aumento"} 
                bgcolor="#F3D20C" 
                color="#000"
                disabled={isPending}
                width="100%"
              />
            </div>
          </section>
        </form>
      </div>
    </Container>
  );
}

const Container = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  background-color: rgba(0, 0, 0, 0.5); display: flex;
  justify-content: center; align-items: center; z-index: 1000;

  .sub-contenedor {
    width: 400px; background: ${({ theme }) => theme.bgtotal};
    border-radius: 20px; padding: 25px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    color: ${({ theme }) => theme.text};
    
    .headers {
      display: flex; justify-content: space-between; margin-bottom: 20px;
      h1 { font-size: 20px; font-weight: 700; margin:0;}
      .subtitle { font-size: 13px; color: #888; margin-top: 5px;}
      .close-btn { cursor: pointer; font-size: 20px; font-weight: bold;}
    }
    .form-subcontainer {
      display: flex; flex-direction: column; gap: 15px;
      .error { color: #d32f5b; font-size: 12px; font-weight:bold; margin-top: -10px;}
    }
    .footer-btn { margin-top: 10px; }
  }
`;