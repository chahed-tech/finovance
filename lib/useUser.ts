"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const uid = data.session.user.id;
        setUser(data.session.user);

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", uid)
          .single();

        if (error) console.error(error);
        else setRole(profile?.role || "user");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user);
      else setUser(null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { user, role };
}