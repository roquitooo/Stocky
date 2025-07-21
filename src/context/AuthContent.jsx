import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/supabase.config";
import { MostrarUsuarios } from "../index";
import { InsertarEmpresa } from "../index";
import { InsertarAdmin } from "../index";
const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
   const [user, setUser] = useState([]);
   useEffect(() => {
     const {data} = supabase.auth.onAuthStateChange(async(event, session) => {
        if(session?.user == null) {
            setUser(null)
        }else {
            setUser(session?.user)
            console.log("session",session.user.id)
          insertarDatos(session?.user.id);
        }
     });
     return () => {
       data.subscription;
     }
   }, []);
   const insertarDatos = async(id_auth) => {
    const response = await MostrarUsuarios({id_auth: id_auth})
    if (response) {
      
    }
    else{
      await InsertarEmpresa({id_auth: id_auth});
      await InsertarAdmin();
    }
   };
   
   return (
     <AuthContext.Provider value={{user}}>
    {children}
     </AuthContext.Provider>
   );
}

export const UserAuth = () => {
  return useContext(AuthContext);
}