import { supabase } from "../supabase/supabase.config";
const tabla = "asignacion_sucursal";

export async function MostrarSucursalCajaAsignada(p) {
  const { data } = await supabase
    .from(tabla)
    .select(`*, sucursales(*), caja(*)`)
    .eq("id_usuario", p.id_usuario)
    .maybeSingle();
    return data;
}

export async function InsertarAsignacionCajaSucursal(p) {
  const { error } = await supabase.from(tabla).insert(p);
  if (error) {
    throw new Error(error.message);
  }
}

export async function ObtenerEmpresaAsignadaUsuario(p) {
  const { data: asignacion, error: errorAsignacion } = await supabase
    .from(tabla)
    .select(`id_sucursal`)
    .eq("id_usuario", p.id_usuario)
    .order("id", { ascending: false })
    .limit(1);

  if (errorAsignacion) {
    throw new Error(errorAsignacion.message);
  }

  const idSucursal = asignacion?.[0]?.id_sucursal;
  if (!idSucursal) return null;

  const { data: sucursal, error: errorSucursal } = await supabase
    .from("sucursales")
    .select("id_empresa")
    .eq("id", idSucursal)
    .maybeSingle();

  if (errorSucursal) {
    throw new Error(errorSucursal.message);
  }

  return sucursal?.id_empresa ?? null;
}

export async function MostrarUsuariosAsignados(p) {
  // BLINDAJE: Si p.id_empresa es undefined, enviamos 0 para que no rompa la estructura
  const empresaId = p.id_empresa || 0; 
  const textoBuscador = p.buscador || "";

  const { data, error } = await supabase.rpc("mostrarusuariosasignados", {
    _id_empresa: empresaId,
    _buscador: textoBuscador
  });
  
  if (error) {
    console.error("Error mostrando usuarios:", error);
    return [];
  }
  return data;
}

export async function BuscarUsuariosAsignados(p) {
  // BLINDAJE: Lo mismo aquí. Evitamos 'undefined' a toda costa.
  const empresaId = p.id_empresa || 0;
  const textoBuscador = p.buscador || "";

  const { data, error } = await supabase.rpc("buscarusuariosasignados", {
    _id_empresa: empresaId,
    _buscador: textoBuscador
  });

  if (error) {
    console.error("Error buscando usuarios:", error);
    return [];
  }
  return data;
}
