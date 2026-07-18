"use client";

import { useSession } from "@/lib/session";

const ROLE_EMOJI: Record<string, string> = { ADMIN: "🛠️", VET: "🩺", DONANTE: "💛" };

export function UserSwitcher() {
  const { users, current, setCurrent } = useSession();
  return (
    <select
      className="user-switcher"
      value={current?.id ?? ""}
      onChange={(e) => setCurrent(users.find((u) => u.id === e.target.value) ?? null)}
      title="Actuar como (Etapa A — reemplaza conexión de wallet)"
    >
      <option value="">Conectar Wallet ▾</option>
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {ROLE_EMOJI[u.role]} {u.name} ({u.role})
        </option>
      ))}
    </select>
  );
}
