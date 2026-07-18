"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, type User } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function AdminPage() {
  const { current } = useSession();
  const router = useRouter();
  const [vets, setVets] = useState<User[]>([]);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [form, setForm] = useState({
    title: "",
    dogName: "",
    shelter: "",
    description: "",
    imageUrl: "",
    material: "TPU Grado Medico",
    goalEth: "0.1",
    diagnosis: "",
    vetId: "",
  });

  useEffect(() => {
    api.listUsers().then((u) => setVets(u.filter((x) => x.role === "VET")));
  }, []);

  if (current?.role !== "ADMIN")
    return (
      <main className="container">
        <div className="page-head">
          <h2>Panel de Administración</h2>
        </div>
        <div className="empty-state">
          <div className="icon">🛠️</div>
          <p style={{ marginBottom: 16 }}>
            Necesitas una cuenta <strong>ADMIN</strong> para crear y gestionar casos.
          </p>
          <Link href="/login"><button className="btn-primary">Conectar como Admin</button></Link>
        </div>
      </main>
    );

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setMsg(null);
    try {
      const body: any = {
        title: form.title,
        dogName: form.dogName,
        shelter: form.shelter,
        description: form.description,
        material: form.material,
        goalEth: Number(form.goalEth),
        vetId: form.vetId,
      };
      if (form.imageUrl) body.imageUrl = form.imageUrl;
      if (form.diagnosis) body.diagnosis = form.diagnosis;
      const c = await api.createCase(body, current.id);
      setMsg({ t: "ok", m: "Caso creado. Redirigiendo…" });
      setTimeout(() => router.push(`/cases/${c.id}`), 800);
    } catch (e) {
      setMsg({ t: "err", m: (e as Error).message });
    }
  };

  return (
    <main className="container">
      <div className="page-head">
        <h2>Crear caso (Admin)</h2>
        <p>Registra el caso con su diagnóstico y veterinario aliado. Quedará en estado <strong>CREADO</strong>.</p>
      </div>

      {msg && <div className={`alert ${msg.t}`}>{msg.m}</div>}

      <div className="form">
        <div><label>Título</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Prótesis de cadera para Firulais" /></div>
        <div className="row">
          <div><label>Nombre del perro</label><input value={form.dogName} onChange={(e) => set("dogName", e.target.value)} /></div>
          <div><label>Refugio / solicitante</label><input value={form.shelter} onChange={(e) => set("shelter", e.target.value)} /></div>
        </div>
        <div><label>Descripción</label><textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
        <div><label>Diagnóstico veterinario</label><textarea rows={2} value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} /></div>
        <div className="row">
          <div><label>Material</label><input value={form.material} onChange={(e) => set("material", e.target.value)} /></div>
          <div><label>Meta (ETH)</label><input type="number" step="0.01" value={form.goalEth} onChange={(e) => set("goalEth", e.target.value)} /></div>
        </div>
        <div><label>URL de imagen (opcional)</label><input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" /></div>
        <div>
          <label>Veterinario aliado</label>
          <select value={form.vetId} onChange={(e) => set("vetId", e.target.value)}>
            <option value="">— seleccionar —</option>
            {vets.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <button className="btn-sm primary" disabled={!form.title || !form.dogName || !form.vetId} onClick={submit}>
          Crear caso
        </button>
      </div>
    </main>
  );
}
