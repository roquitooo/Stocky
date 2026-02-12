import { create } from "zustand";
import {
  EliminarUsuarioAsignado,
  EditarUsuario,
  InsertarUsuarios,
  MostrarUsuarios,
  ObtenerIdAuthPorEmail,
} from "../supabase/crudUsuarios";
import { InsertarCredencialesUser, ObtenerIdAuthSupabase } from "../supabase/crudUsuarios";
import {
  InsertarAsignacionCajaSucursal,
  ObtenerEmpresaAsignadaUsuario,
} from "../supabase/crudAsignacionCajaSucursal";
import { usePermisosStore } from "./PermisosStore";
import { EliminarPermisos, InsertarPermisos } from "../supabase/crudPermisos";

export const useUsuariosStore = create((set) => ({
  refetchs: null,
  datausuarios: [],

  mostrarusuarios: async () => {
    const idauth = await ObtenerIdAuthSupabase();
    const response = await MostrarUsuarios({ id_auth: idauth });
    set({ datausuarios: response });
    return response;
  },

  eliminarUsuarioAsignado: async (p) => {
    await EliminarUsuarioAsignado(p);
  },

  editarUsuario: async (p) => {
    await EditarUsuario(p);

    if (Array.isArray(p.modulos)) {
      await EliminarPermisos({ id_usuario: p.id });
      if (p.modulos.length > 0) {
        await Promise.all(
          p.modulos.map(async (idmodulo) => {
            await InsertarPermisos({ id_usuario: p.id, idmodulo });
          })
        );
      }
    }
  },

  insertarUsuario: async (p) => {
    const rawModules = usePermisosStore.getState().selectedModules || [];
    const selectModules = [...new Set(rawModules)];

    // Precheck: if email already exists and belongs to a user assigned to another company, abort early.
    let idAuthGenerado = null;
    try {
      idAuthGenerado = await ObtenerIdAuthPorEmail({ p_email: p.email });
    } catch {
      idAuthGenerado = null;
    }

    const validarConflictoEmpresa = async (idAuth) => {
      if (!idAuth || !p.id_empresa) return;
      const usuarioExistente = await MostrarUsuarios({ id_auth: idAuth });
      if (!usuarioExistente?.id) return;

      const empresaAsignada = await ObtenerEmpresaAsignadaUsuario({
        id_usuario: usuarioExistente.id,
      });

      if (empresaAsignada && Number(empresaAsignada) !== Number(p.id_empresa)) {
        throw new Error(
          `Ese correo ya pertenece a un usuario asignado a otra empresa (${empresaAsignada}). Usa otro correo o elimina esa asignacion primero.`
        );
      }
    };

    await validarConflictoEmpresa(idAuthGenerado);

    // Create Auth credentials only if needed.
    if (!idAuthGenerado) {
      try {
        idAuthGenerado = await InsertarCredencialesUser({
          p_email: p.email,
          p_pass: p.pass,
        });
      } catch (error) {
        const msg = String(error?.message || "");
        const isDup =
          msg.includes("users_email_partial_key") ||
          msg.includes("duplicate key value");

        if (!isDup) throw error;

        // Race condition safety: user was created concurrently.
        try {
          idAuthGenerado = await ObtenerIdAuthPorEmail({ p_email: p.email });
        } catch (lookupError) {
          const lookupMsg = String(lookupError?.message || "");
          if (lookupMsg.includes("not_allowed")) {
            throw new Error(
              "No se pudo validar el correo en Auth (not_allowed). Usa otro correo o habilita permisos del RPC obtener_id_auth_por_email."
            );
          }
          throw lookupError;
        }
        await validarConflictoEmpresa(idAuthGenerado);
      }
    }

    // Step 2: create/update public user row.
    let dataUserNew = null;
    try {
      dataUserNew = await InsertarUsuarios({
        nombres: p.nombres,
        nro_doc: p.nro_doc,
        telefono: p.telefono,
        id_rol: p.id_rol,
        correo: p.email,
        id_auth: idAuthGenerado,
      });
    } catch (error) {
      throw new Error(
        `Fallo la creacion del usuario: ${error.message}. Importante: revisa Auth para ${p.email}.`
      );
    }

    // Step 3: assignments + permissions.
    try {
      await InsertarAsignacionCajaSucursal({
        id_sucursal: p.id_sucursal,
        id_usuario: dataUserNew?.id,
        id_caja: p.id_caja,
      });

      if (Array.isArray(selectModules) && selectModules.length > 0) {
        await Promise.all(
          selectModules.map(async (idModule) => {
            await InsertarPermisos({
              id_usuario: dataUserNew?.id,
              idmodulo: idModule,
            });
          })
        );
      }
    } catch (error) {
      const msg = String(error?.message || "");
      if (msg.includes("otra empresa")) {
        throw error;
      }
      throw new Error("El usuario se creo pero fallaron las asignaciones: " + error.message);
    }
  },
}));
