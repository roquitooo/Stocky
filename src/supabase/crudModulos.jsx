import { supabase } from "../index";
const tabla = "modulos";
export async function MostrarModulos() {
  const { data } = await supabase
    .from(tabla)
    .select();
  return data;
}
