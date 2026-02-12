import Swal from "sweetalert2";
import { supabase } from "../index";
const tabla = "usuarios";
export async function MostrarUsuarios(p) {
  const { data, error } = await supabase
    .from(tabla)
    .select()
    .eq("id_auth", p.id_auth)
    .maybeSingle();
  if (error) {
    return;
  }
  return data;
}
export async function InsertarAdmin(p) {
  const { error } = await supabase.from(tabla).insert(p);
  if (error) {
    throw new Error(error.message);
  }
}
export async function InsertarUsuarios(p) {
  const { error, data } = await supabase
    .from(tabla)
    .upsert(p, { onConflict: "id_auth" })
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export async function EditarUsuario(p) {
  const payloadBase = {
    nombres: p?.nombres,
    nro_doc: p?.nro_doc,
    telefono: p?.telefono,
    id_rol: p?.id_rol,
    correo: p?.correo,
  };
  const payload = Object.fromEntries(
    Object.entries(payloadBase).filter(([, value]) => value !== undefined)
  );

  const { error, data } = await supabase
    .from(tabla)
    .update(payload)
    .eq("id", p.id)
    .select()
    .maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export async function InsertarCredencialesUser(p) {
  const { data, error } = await supabase.rpc("crearcredencialesuser", p);
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export async function ObtenerIdAuthSupabase() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session != null) {
    const { user } = session;
    const idauth = user.id;
    return idauth;
  }
}
export async function EliminarUsuarioAsignado(p) {
  const { error } = await supabase.from(tabla).delete().eq("id", p.id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function ObtenerIdAuthPorEmail(p) {
  const { data, error } = await supabase.rpc("obtener_id_auth_por_email", p);
  if (error) throw new Error(error.message);
  return data;
}
