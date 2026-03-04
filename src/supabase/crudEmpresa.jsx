import Swal from "sweetalert2";
import { supabase } from "../index";
const tabla = "empresa";
export async function InsertarEmpresa(p) {
  const payload = {
    simbolo_moneda:
      typeof p?.simbolo_moneda === "string" && p.simbolo_moneda.trim() !== ""
        ? p.simbolo_moneda
        : "$",
    iso:
      typeof p?.iso === "string" && p.iso.trim() !== ""
        ? p.iso
        : "AR",
    pais:
      typeof p?.pais === "string" && p.pais.trim() !== ""
        ? p.pais
        : "Argentina",
    currency:
      typeof p?.currency === "string" && p.currency.trim() !== ""
        ? p.currency
        : "ARS",
    ...p,
  };

  const { data, error } = await supabase
    .from(tabla)
    .insert(payload)
    .select()
    .maybeSingle();
  if (error) {
    // Swal.fire({
    //   icon: "error",
    //   title: "Oops...empresa",
    //   text: error.message,
    // });
    return;
  }
  return data;
}

export async function MostrarEmpresaXidsuario(p) {
  const { data } = await supabase.rpc("mostrarempresaxiduser", p).maybeSingle();
  return data;
}
export async function MostrarEmpresaXid(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id", p.id)
    .maybeSingle();
  return data;
}
export async function EditarMonedaEmpresa(p){
  const {error}= await supabase.from(tabla).update(p).eq("id",p.id)
  if(error){
     Swal.fire({
       icon: "error",
       title: "Oops...editar moneda empresa",
       text: error.message,
     });
     return;
  }
}
export async function EditarLogoEmpresa(p){
  const {error}= await supabase.from(tabla).update(p).eq("id",p.id)
  if(error){
     Swal.fire({
       icon: "error",
       title: "Oops...editar logo empresa",
       text: error.message,
     });
     return;
  }
}
export async function EditarEmpresa(p,fileold,filenew){
  const {error}= await supabase.from(tabla).update(p).eq("id",p.id)
  if(error){
     Swal.fire({
       icon: "error",
       title: "Oops...editar empresa",
       text: error.message,
     });
     return;
  }
  if(filenew!="-" && filenew.size !=undefined){
    if(fileold!="-"){
      await EditarIconoStorage(p.id,filenew)
    }else{
      const dataImagen = await subirImagen(p.id,filenew)
      const plogoeditar={
        logo:dataImagen.publicUrl,
        id:p.id
      }
      await EditarLogoEmpresa(plogoeditar)
    }
  }
}

export async function EditarIconoStorage(id,file){
  const ruta = "empresa/"+id
  await supabase.storage.from("imagenes").update(ruta,file,{
    cacheControl:"0",
    upsert:true
  })
}
async function subirImagen (idempresa,file){
  const ruta = "empresa/"+idempresa
  const {data, error}= await supabase.storage.from("imagenes").upload(ruta,file,{
    cacheControl:"0",
    upsert:true
  })
  if(error){
    Swal.fire({
      icon: "error",
      title: "Oops...editar empresa",
      text: error.message,
    });
    return;
  }
  if(data){
    const {data:urlimagen} = await supabase.storage.from("imagenes").getPublicUrl(ruta)
    return urlimagen
  }

}
