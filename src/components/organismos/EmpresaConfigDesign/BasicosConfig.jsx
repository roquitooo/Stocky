import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useRef, useState } from "react";
import styled from "styled-components";
import { InputText2 } from "../formularios/InputText2";
import { Btn1 } from "../../moleculas/Btn1";
import { useForm } from "react-hook-form";
import { useEmpresaStore } from "../../../store/EmpresaStore";
// import { slideBackground } from "../../../styles/keyframes"; // <-- LINEA ELIMINADA (Ya no se usa)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const BasicosConfig = () => {
  const [file, setFile] = useState([]);
  const ref = useRef(null);
  const [fileurl, setFileurl] = useState("-");
  const { dataempresa, editarEmpresa } = useEmpresaStore();
  const queyClient = useQueryClient();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  function abrirImagenes() {
    ref.current.click();
  }
  function prepararImagen(e) {
    let filelocal = e.target.files;
    let fileReaderlocal = new FileReader();
    fileReaderlocal.readAsDataURL(filelocal[0]);
    const tipoimg = e.target.files[0];
    setFile(tipoimg);
    if (fileReaderlocal && filelocal && filelocal.length) {
      fileReaderlocal.onload = function load() {
        setFileurl(fileReaderlocal.result);
      };
    }
  }
  const { mutate: doEditar, isPending } = useMutation({
    mutationKey: "editar empresa",
    mutationFn: editar,
    onError: (error) => {
      toast.error("Ocurrio un error " + error.message);
    },
    onSuccess: () => {
      toast.success("Datos guardados");
      queyClient.invalidateQueries("mostrar empresa");
    },
  });
  const llamadoafuncioneditar = (data) => {
    doEditar(data);
  };
  async function editar(data) {
    const p = {
      id: dataempresa?.id,
      nombre: data.nombre,
      direccion_fiscal: data.direccion,
      impuesto: data.impuesto,
      valor_impuesto: parseFloat(data.valor_impuesto),
    };
    await editarEmpresa(p, dataempresa?.logo, file);
  }

  return (
    <Container>
      {isPending ? (
        <span>Guardando...</span>
      ) : (
        <>
          <Title>Básico</Title>

          <Avatar>
            <span className="nombre">{dataempresa?.nombre}</span>
            {fileurl != "-" ? (
              <div className="ContentImage">
                <AvatarImage src={fileurl} alt="Avatar" />
              </div>
            ) : dataempresa?.logo != "-" ? (
              <div className="ContentImage">
                <AvatarImage src={dataempresa?.logo} alt="Avatar" />
              </div>
            ) : (
              <AvatarImage
                src="https://i.ibb.co/JjqNqnz/cerdosolo.png"
                alt="Avatar"
              />
            )}

            <EditButton onClick={abrirImagenes}>
              <Icon className=" icono" icon="lets-icons:edit-fill" />
            </EditButton>
            <input
              accept="image/jpeg, image/png"
              type="file"
              ref={ref}
              onChange={(e) => prepararImagen(e)}
            ></input>
          </Avatar>
          <form onSubmit={handleSubmit(llamadoafuncioneditar)}>
            <Label>Nombre</Label>
            <InputText2>
              <input
                className="form__field"
                placeholder="Nombre"
                type="text"
                defaultValue={dataempresa?.nombre}
                {...register("nombre", {
                  required: true,
                })}
              />
              {errors.nombre?.type === "required" && <p>Campo requerido</p>}
            </InputText2>
            <Label>Dirección</Label>
            <InputText2>
              <input
                defaultValue={dataempresa?.direccion_fiscal}
                className="form__field"
                placeholder="Direccion"
                type="text"
                {...register("direccion", {
                  required: true,
                })}
              />
              {errors.direccion?.type === "required" && <p>Campo requerido</p>}
            </InputText2>
            <Label>Impuesto</Label>
            <InputText2>
              <input
                defaultValue={dataempresa?.impuesto}
                className="form__field"
                placeholder="Impuesto"
                type="text"
                {...register("impuesto", {
                  required: true,
                })}
              />
              {errors.impuesto?.type === "required" && <p>Campo requerido</p>}
            </InputText2>
            <Label>Valor impuesto</Label>
            <InputText2>
              <input
                step="0.01"
                defaultValue={dataempresa?.valor_impuesto}
                className="form__field"
                placeholder="Valor impuesto"
                type="number"
                {...register("valor_impuesto", {
                  required: true,
                })}
              />
              {errors.valor_impuesto?.type === "required" && (
                <p>Campo requerido</p>
              )}
            </InputText2>
            <br></br>
            
            <Btn1 
                bgcolor="#ffbd59" 
                color="#fff" 
                titulo="GUARDAR CAMBIOS" 
            />
          </form>
          <br></br>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  margin: 0 auto;
  p {
    color: #f75510;
    font-weight: 700;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Avatar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
  border-radius: 10px;
  padding: 10px;
  .nombre {
    font-weight: 700;
    position: absolute;
    text-align: center;
    align-self: center;
    margin: auto;
    top: 0;
    left: 100px;
    bottom: 0;
    right: 10px;
    font-size: 25px;
    overflow: hidden;
    white-space: normal;
    word-wrap: break-word;
    color: #fff !important;
  }
  
  /* --- CAMBIO AQUÍ --- */
  background-color: #ffbd59; /* Color Sólido Stocky */
  /* Se eliminaron las líneas de background-image y animation */
  /* ------------------- */

  img {
    object-fit: cover;
  }
  input {
    display: none;
  }
`;

const AvatarImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 10px;
  margin-right: 10px;
`;

const EditButton = styled.button`
  background-color: #00aaff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 60px;
  top: 10px;
  margin: auto;
  .icono {
    font-size: 20px;
  }
`;

const Label = styled.label`
  display: block;
  margin: 10px 0 5px;
`;