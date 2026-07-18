"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { api, type User } from "./api";

/**
 * Sesion de Etapa A: "actuar como" un usuario existente (admin/vet/donante).
 * En la Etapa B esto se reemplaza por conexion de wallet (SIWE).
 */
interface SessionCtx {
  users: User[];
  current: User | null;
  setCurrent: (u: User | null) => void;
  reload: () => void;
}

const Ctx = createContext<SessionCtx>({
  users: [],
  current: null,
  setCurrent: () => {},
  reload: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [current, setCurrentState] = useState<User | null>(null);

  const reload = () => {
    api
      .listUsers()
      .then((list) => {
        setUsers(list);
        const savedId = typeof window !== "undefined" ? localStorage.getItem("vp_user") : null;
        const found = list.find((u) => u.id === savedId) ?? null;
        setCurrentState(found);
      })
      .catch(() => setUsers([]));
  };

  useEffect(reload, []);

  const setCurrent = (u: User | null) => {
    setCurrentState(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem("vp_user", u.id);
      else localStorage.removeItem("vp_user");
    }
  };

  return (
    <Ctx.Provider value={{ users, current, setCurrent, reload }}>{children}</Ctx.Provider>
  );
}

export const useSession = () => useContext(Ctx);
