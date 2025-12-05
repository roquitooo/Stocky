import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.config";
import {
  MostrarUsuarios,
  InsertarEmpresa,
} from "../index";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState([]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session == null) {
        setUser(null);
      } else {
        setUser(session?.user);
        insertarDatos(session?.user.id, session?.user.email);
      }
    });
    return () => {
      data.subscription;
    };
  }, []);

  const insertarDatos = async (id_auth, correo) => {
    const response = await MostrarUsuarios({ id_auth: id_auth });
    if (response) {
      return;
    } else {
      await InsertarEmpresa({ id_auth: id_auth, correo: correo });
    }
  };

  // --- AGREGAMOS ESTA FUNCIÓN ---
  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  return (
    // --- PASAMOS LA FUNCIÓN EN EL VALUE ---
    <AuthContext.Provider value={{ user, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};