import Swal from "sweetalert2";
import { supabase } from "../index";
const tabla = "empresa";
export async function InsertarEmpresa(p) {
  const { data, error } = await supabase
    .from(tabla)
    .insert(p)
    .select()
    .maybeSingle();
  if (error) {
    // Swal.fire({
    //   icon: "error",
    //   title: "Oops...",
    //   text: error.message,
    // });
    return;
  }
  return data;
}

export async function mostrarempresaxiduser() {
  const p = 74
  const { data } = await supabase.rpc("mostrarempresaxiduser",{ _id_usuario: p }).maybeSingle();
  console.log("data empresa", data);
  console.log("parametro", p);
  return data;
}

