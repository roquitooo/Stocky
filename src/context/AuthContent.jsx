import { createContext, useContext, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
// 👇 CORRECCIÓN 1: Imports directos para evitar bucles de dependencias
import { supabase } from "../supabase/supabase.config";
import { InsertarUsuarios, MostrarUsuarios } from "../supabase/crudUsuarios"; // Importa directo
import { InsertarEmpresa } from "../supabase/crudEmpresa";   // Importa directo
import { MostrarRolesXnombre } from "../supabase/crudRol";
import { MostrarModulos } from "../supabase/crudModulos";
import { InsertarPermisos } from "../supabase/crudPermisos";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // 👇 CORRECCIÓN 2: Inicia en null (no en []), para no engañar a las rutas
  const [user, setUser] = useState(null);
  // 👇 CORRECCIÓN 3: Estado para saber si Supabase ya respondió
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session) {
          setUser(null);
          setIsReady(true);
          return;
        }

        // Si hay sesión, guardamos el usuario y verificamos datos
        setUser(session.user);

        // Evita loop infinito de loading si alguna llamada a Supabase se cuelga.
        await Promise.race([
          insertarDatos(session.user),
          new Promise((resolve) => setTimeout(resolve, 8000)),
        ]);

        setIsReady(true);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const insertarDatos = async (user) => {
    const id_auth = user?.id;
    const correo = user?.email || "";
    const nombreBase =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      correo.split("@")[0] ||
      "Usuario";

    if (!id_auth) return;

    try {
      const response = await MostrarUsuarios({ id_auth });
      if (response?.id) {
        return;
      }

      // Flujo original: crear empresa inicial (si tu BD tiene trigger, puede crear usuario aquí).
      await InsertarEmpresa({
        id_auth,
        correo,
        simbolo_moneda: "$",
        iso: "AR",
        pais: "Argentina",
        currency: "ARS",
      });

      // Re-validamos por si el trigger ya creó usuario/permisos.
      const usuarioPostEmpresa = await MostrarUsuarios({ id_auth });
      if (usuarioPostEmpresa?.id) return;

      // Fallback robusto: crear usuario en tabla public.usuarios.
      const rolAdmin = await MostrarRolesXnombre({ nombre: "admin" });
      const usuarioNuevo = await InsertarUsuarios({
        nombres: nombreBase,
        correo,
        id_auth,
        id_rol: rolAdmin?.id ?? null,
      });

      // Si existe rol admin, damos acceso completo a módulos.
      if (usuarioNuevo?.id && rolAdmin?.id) {
        const modulos = await MostrarModulos();
        await Promise.all(
          (modulos || []).map(async (modulo) => {
            try {
              await InsertarPermisos({
                id_usuario: usuarioNuevo.id,
                idmodulo: modulo.id,
              });
            } catch {
              // Evita cortar login por duplicados o RLS puntuales.
            }
          })
        );
      }
    } catch (error) {
      console.error("Error al insertar datos iniciales:", error);
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsReady(true);
  };

  // 👇 CORRECCIÓN 4: Pantalla de carga inicial
  // No dejamos que la app cargue hasta saber si el usuario está logueado o no.
  if (!isReady) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <BarLoader color="#36d7b7" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
