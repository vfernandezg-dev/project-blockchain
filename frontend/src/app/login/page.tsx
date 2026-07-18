"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session";
import { api, type User } from "@/lib/api";
import { connectWallet, hasMetaMask } from "@/lib/eth";

const DEMO: { label: string; wallet: string; emoji: string }[] = [
  { label: "Admin", wallet: "0x41270b3ea88088571250e75f7c098f441bacd2c4", emoji: "🛠️" },
  { label: "Veterinario", wallet: "0xea3e8943ac023cdc8054a1d56ad9d4611274508c", emoji: "🩺" },
  { label: "Donante", wallet: "pedro.eth", emoji: "💛" },
];

export default function LoginPage() {
  const { setCurrent } = useSession();
  const router = useRouter();
  const [wallet, setWallet] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  // Evita mismatch de hidratacion: window.ethereum solo existe en el cliente
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

  // Conexión real con MetaMask: usa la dirección de la wallet como identidad.
  const connectMetaMask = async () => {
    setErr("");
    setLoading(true);
    try {
      const address = await connectWallet(); // pide cuenta + asegura Sepolia
      const user = await api.loginWallet(address); // find-or-create donante
      setCurrent(user);
      router.push("/dashboard");
    } catch (e) {
      const err = e as { code?: string | number; message?: string };
      // Usuario canceló en MetaMask: no mostrar error, solo salir limpio.
      if (err?.code === "ACTION_REJECTED" || err?.code === 4001) {
        return;
      }
      setErr(err?.message ?? "No se pudo conectar la wallet.");
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
          Conecta tu wallet real con MetaMask, o entra por alias para la demo.
        </p>

        <button
          type="button"
          className="btn-primary"
          style={{ width: "100%", marginBottom: 8 }}
          disabled={loading}
          onClick={connectMetaMask}
        >
          {loading
            ? "Conectando…"
            : mounted && !hasMetaMask()
              ? "🦊 Instalar MetaMask"
              : "🦊 Conectar MetaMask"}
        </button>

        <div className="login-sep"><span>o por alias (demo)</span></div>

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
