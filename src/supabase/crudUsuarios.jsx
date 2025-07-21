import { supabase } from "../index";
const tabla = "usuarios";

export async function MostrarUsuarios(p) {
    const {data} = await supabase
        .from(tabla)
        .select()
        .eq('id_auth', p.id_auth)
        .maybeSingle();
    return data;
}
export async function InsertarAdmin(p){
    await supabase.from(tabla).insert(p);
}