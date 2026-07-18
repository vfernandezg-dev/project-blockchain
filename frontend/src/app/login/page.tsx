"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { api, type User } from "@/lib/api";

const DEMO: { label: string; wallet: string; emoji: string }[] = [
  { label: "Admin", wallet: "vitalpaws.eth", emoji: "🛠️" },
  { label: "Veterinario", wallet: "vet-trujillo.eth", emoji: "🩺" },
  { label: "Donante", wallet: "pedro.eth", emoji: "💛" },
];

export default function LoginPage() {
  const { setCurrent } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const connect = async (value: string) => {
    const w = value.trim().toLowerCase();
    if (!w) return;
    setErr("");
    setLoading(true);
    try {
      const users = await api.listUsers();
      const user = users.find((u: User) => u.wallet.toLowerCase() === w);
      if (!user) {
        setErr(`No existe una cuenta con la wallet "${w}".`);
        return;
      }
      setCurrent(user);
      router.push("/dashboard");
    } catch {
      setErr("No se pudo conectar con el servidor. ¿Está corriendo el backend?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrap">
      <div className="login-card">
        <img className="login-logo" src="/logo-full.png" alt="VitalPaws" />
        <h1>Conectar cuenta</h1>
        <p className="muted">
          Ingresa tu wallet para acceder. En esta etapa el acceso es por alias
          (Etapa A → luego firma de wallet).
        </p>

        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            connect(wallet);
          }}
        >
          <label htmlFor="wallet">Wallet</label>
          <input
            id="wallet"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="vitalpaws.eth"
            autoComplete="off"
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={loading || !wallet.trim()}>
            {loading ? "Conectando…" : "Conectar"}
          </button>
        </form>

        {err && <div className="alert err" style={{ marginTop: 4 }}>{err}</div>}

        <div className="login-demo">
          <span className="muted">Acceso rápido (demo):</span>
          <div className="login-demo-row">
            {DEMO.map((d) => (
              <button
                key={d.wallet}
                type="button"
                className="btn-sm ghost"
                disabled={loading}
                onClick={() => connect(d.wallet)}
              >
                {d.emoji} {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
