import styled from "styled-components";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Btn1, InputText2, Switch1 } from "../../../index"; // Importamos Switch1
import { useProductosStore } from "../../../store/ProductosStore";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function AumentarPrecio({ onClose, selectedIds, setIsExploding }) {
  const { aumentarPrecioSeleccion } = useProductosStore();
  const queryClient = useQueryClient();
  
  // Estado para el switch: true = Porcentaje, false = Monto Fijo ($)
  const [esPorcentaje, setEsPorcentaje] = useState(true);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const { isPending, mutate } = useMutation({
    mutationFn: async (data) => {
      const p = {
        ids: selectedIds, 
        valor: parseFloat(data.valor), // Enviamos el valor
        esPorcentaje: esPorcentaje     // Enviamos el tipo de aumento
      };
      console.log("Enviando:", p);
      return await aumentarPrecioSeleccion(p);
    },
    onSuccess: (exito) => {
      if(exito) {
        toast.success(`Precios actualizados correctamente`);
        queryClient.invalidateQueries(["mostrar productos"]); 
        if(setIsExploding) setIsExploding(true); 
        onClose();
      } else {
        toast.error("Error al actualizar. Revisa la consola.");
      }
    },
    onError: (err) => {
      toast.error("Error: " + err.message);
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
            <span onClick={onClose} className="close-btn">X</span>
          </section>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="form-subcontainer">
            
            {/* --- SWITCH DE TIPO DE AUMENTO --- */}
            <div className="switch-container">
                <span className={!esPorcentaje ? "active" : ""}>$ Monto</span>
                <Switch1 state={esPorcentaje} setState={() => setEsPorcentaje(!esPorcentaje)} />
                <span className={esPorcentaje ? "active" : ""}>% Porcentaje</span>
            </div>

            <label>
                {esPorcentaje ? "Porcentaje de aumento (%)" : "Monto a aumentar ($)"}
            </label>
            
            <InputText2>
              <input
                className="form__field"
                type="number"
                step="0.01"
                placeholder={esPorcentaje ? "Ej: 10%" : "Ej: $500"}
                autoFocus
                {...register("valor", { required: true, min: 0.01 })}
              />
            </InputText2>
            {errors.valor && <p className="error">Ingrese un valor válido</p>}

            <div className="footer-btn">
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
      display: flex; justify-content: space-between; margin-bottom: 15px;
      h1 { font-size: 20px; font-weight: 700; margin:0;}
      .subtitle { font-size: 13px; color: #888; margin-top: 5px;}
      .close-btn { cursor: pointer; font-size: 20px; font-weight: bold;}
    }
    
    .form-subcontainer {
      display: flex; flex-direction: column; gap: 15px;
      
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-bottom: 5px;
        font-size: 14px;
        color: #888;
        
        .active {
            color: ${({ theme }) => theme.text};
            font-weight: bold;
        }
      }

      .error { color: #d32f5b; font-size: 12px; font-weight:bold; margin-top: -10px;}
    }
    .footer-btn { margin-top: 10px; }
  }
`;