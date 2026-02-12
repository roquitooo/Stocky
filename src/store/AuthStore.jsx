import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";

export const useAuthStore = create(() => ({
  loginGoogle: async () => {
    // Recomendado para local:
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  },

  loginEmailPass: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  cerrarSesion: async () => {
    await supabase.auth.signOut();
  },
}));
