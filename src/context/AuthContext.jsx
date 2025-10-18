// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS?.split(",") || [];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        // Example: check "profiles" table for subscription status
        const { data, error } = await supabase
          .from("profiles")
          .select("is_paid")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setIsPaid(data.is_paid);
        }
      }

      setLoading(false);
    };

    getUser();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setCurrentUser(session?.user || null);
      }
    );

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email);

  const value = {
    currentUser,
    isAdmin,
    isPaid,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
