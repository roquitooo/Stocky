import Swal from "sweetalert2";
import { supabase } from "../index";
const tabla = "tipodocumento";
export async function MostrarTipoDocumentos(p) {
  const { data } = await supabase
    .from(tabla)
    .select()
    .eq("id_empresa", p.id_empresa);

  if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.message,
      });
      return;
    }

  return data;
}
