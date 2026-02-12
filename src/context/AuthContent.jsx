import { createContext, useContext, useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
// 👇 CORRECCIÓN 1: Imports directos para evitar bucles de dependencias
import { supabase } from "../supabase/supabase.config";
import { MostrarUsuarios } from "../supabase/crudUsuarios"; // Importa directo
import { InsertarEmpresa } from "../supabase/crudEmpresa";   // Importa directo

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
        
        // Ejecutamos tu lógica de inserción en segundo plano
        // (No bloqueamos el renderizado por esto, para que sea rápido)
        insertarDatos(session.user.id, session.user.email);
        
        setIsReady(true);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const insertarDatos = async (id_auth, correo) => {
    try {
      const response = await MostrarUsuarios({ id_auth: id_auth });
      if (response) {
        return;
      } else {
        // Si no existe, creamos la empresa (según tu lógica original)
        await InsertarEmpresa({ id_auth: id_auth, correo: correo });
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