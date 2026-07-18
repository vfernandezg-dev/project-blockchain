"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api, type Case } from "@/lib/api";
import { useSession } from "@/lib/session";
import { StatusBadge } from "@/components/StatusBadge";
import { StepsTracker } from "@/components/StepsTracker";
import { onchainEnabled, ETHERSCAN_TX } from "@/lib/contracts";
import {
  donarOnchain,
  validarOnchain,
  connectWallet,
  crearCasoOnchain,
  publicarOnchain,
  fabricarOnchain,
  instalarOnchain,
} from "@/lib/eth";

export default function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { current } = useSession();
  const [c, setCase] = useState<Case | null>(null);
  const [amount, setAmount] = useState("0.03");
  const [clinic, setClinic] = useState("");
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  const load = () => api.getCase(id).then(setCase).catch(() => setCase(null));
  useEffect(() => {
    load();
  }, [id]);

  if (!c) return <main className="container"><p className="muted" style={{ padding: 40 }}>Cargando…</p></main>;

  const pct = Math.min(100, Math.round((c.raisedEth / c.goalEth) * 100));
  const isAdmin = current?.role === "ADMIN";
  const isDonor = current?.role === "DONANTE";
  const isCaseVet = current?.role === "VET" && current?.id === c.vetId;

  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setMsg(null);
    try {
      await fn();
      await load();
      setMsg({ t: "ok", m: okMsg });
    } catch (e) {
      setMsg({ t: "err", m: (e as Error).message });
    }
  };

  // ¿Este caso opera on-chain? (contratos configurados + id on-chain vinculado)
  const chain = onchainEnabled() && !!c.onchainId;

  const doDonate = () =>
    run(async () => {
      if (chain) {
        const wallet = await connectWallet();
        const txHash = await donarOnchain(c.onchainId!, amount); // tx real MetaMask
        await api.donate(c.id, current!.id, Number(amount), { txHash, wallet });
      } else {
        await api.donate(c.id, current!.id, Number(amount)); // simulado (Etapa A)
      }
    }, chain ? "¡Donación on-chain confirmada!" : "¡Donación registrada!");

  const doValidate = () =>
    run(async () => {
      let txHash: string | undefined;
      if (chain) {
        const uri = c.evidenceUrl || `vitalpaws-case-${c.onchainId}`;
        txHash = await validarOnchain(c.onchainId!, uri); // mintea NFTs on-chain
      }
      await api.validate(c.id, current!.id, { clinic, txHash });
    }, chain ? "Validado on-chain → NFTs minteados" : "Validado → NFTs emitidos");

  // Admin registra el caso en el contrato (crea + publica) y lo vincula
  const doRegisterOnchain = () =>
    run(async () => {
      const vetWallet = c.vet?.wallet ?? "";
      if (!vetWallet.startsWith("0x")) {
        throw new Error("El veterinario del caso necesita una dirección de wallet real (0x…)");
      }
      await connectWallet();
      const { id: onchainId } = await crearCasoOnchain(String(c.goalEth), vetWallet);
      await publicarOnchain(onchainId);
      await api.linkOnchain(c.id, onchainId, current!.id);
      if (c.status === "CREADO") await api.publish(c.id, current!.id); // sincroniza backend
    }, "Caso registrado y publicado on-chain");

  // Admin: fabricar / instalar — on-chain + backend
  const doFabricate = () =>
    run(async () => {
      if (chain) await fabricarOnchain(c.onchainId!);
      await api.fabricate(c.id, current!.id);
    }, chain ? "En fabricación (on-chain)" : "En fabricación");

  const doInstall = () =>
    run(async () => {
      if (chain) await instalarOnchain(c.onchainId!);
      await api.install(c.id, current!.id);
    }, chain ? "Instalada (on-chain)" : "Prótesis instalada");

  return (
    <main className="container">
      <div className="page-head" style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <StatusBadge status={c.status} />
        <h2 style={{ fontSize: 26 }}>{c.title}</h2>
      </div>
      <StepsTracker status={c.status} />

      {msg && <div className={`alert ${msg.t}`}>{msg.m}</div>}

      <div className="detail">
        <div>
          {c.imageUrl ? (
            <img className="detail-img" src={c.imageUrl} alt={c.dogName} />
          ) : (
            <div className="img-placeholder" style={{ height: 260, borderRadius: "var(--radius)", marginBottom: 20 }}>🐾</div>
          )}
          <div className="panel">
            <h3>Sobre el caso</h3>
            <p className="muted">{c.description}</p>
            <div className="donation-item"><span>Perro</span><strong>{c.dogName}</strong></div>
            <div className="donation-item"><span>Refugio</span><strong>{c.shelter}</strong></div>
            <div className="donation-item"><span>Material</span><strong>{c.material}</strong></div>
            <div className="donation-item"><span>Veterinario</span><strong>{c.vet?.name ?? "—"}</strong></div>
            {c.diagnosis && <div className="donation-item"><span>Diagnóstico</span><strong>{c.diagnosis}</strong></div>}
            {c.clinic && <div className="donation-item"><span>Clínica validadora</span><strong>{c.clinic}</strong></div>}
          </div>

          {c.donations && c.donations.length > 0 && (
            <div className="panel">
              <h3>Donaciones ({c.donations.length})</h3>
              {c.donations.map((d) => (
                <div key={d.id} className="donation-item">
                  <span>{d.donor?.name ?? "Anónimo"}</span>
                  <span>
                    <strong>{d.amountEth} ETH</strong>{" "}
                    {d.txHash.startsWith("sim-") ? (
                      <span className="muted">· {d.txHash.slice(0, 12)}…</span>
                    ) : (
                      <a
                        className="muted"
                        href={`${ETHERSCAN_TX}${d.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--gold-dark)" }}
                      >
                        · ver en Etherscan ↗
                      </a>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {c.certs && c.certs.length > 0 && (
            <div className="panel">
              <h3>Certificados de Impacto (NFT)</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {c.certs.map((cert) => (
                  <div key={cert.id} className="cert">
                    <h4>NFT #{cert.tokenId} → {cert.owner?.name}</h4>
                    <p className="muted" style={{ color: "#cbd5e1" }}>{cert.metadata?.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Recaudación */}
          <div className="panel">
            <h3>Recaudación</h3>
            <div className="progress"><span style={{ width: `${pct}%` }} /></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ color: "var(--navy)" }}>{c.raisedEth} ETH</strong>
              <span className="muted">meta {c.goalEth} ETH · {pct}%</span>
            </div>

            {/* Donar (rol DONANTE, caso PUBLICADO) */}
            {c.status === "PUBLICADO" && (
              <div style={{ marginTop: 16 }}>
                {onchainEnabled() && !c.onchainId ? (
                  // On-chain activo pero el caso aún no está en el contrato:
                  // donar aquí crearía una donación off-chain que desincroniza
                  // el estado y hace revertir fabricar/validar. Se bloquea.
                  <p className="muted" style={{ marginTop: 12 }}>
                    ⛓️ Este caso todavía no está registrado on-chain. El
                    administrador debe registrarlo antes de poder donar.
                  </p>
                ) : isDonor ? (
                  <div className="row" style={{ alignItems: "flex-end" }}>
                    <div>
                      <label>Monto (ETH)</label>
                      <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" min="0.001" />
                    </div>
                    <button className="btn-sm gold" onClick={doDonate}>
                      {chain ? "Donar con MetaMask" : "Donar"}
                    </button>
                  </div>
                ) : (
                  <p className="muted" style={{ marginTop: 12 }}>
                    <Link href="/login" style={{ color: "var(--gold-dark)", fontWeight: 600 }}>Conéctate</Link> como <strong>DONANTE</strong> para donar.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Acciones por rol */}
          {(isAdmin || isCaseVet) && (
            <div className="panel">
              <h3>Acciones {isAdmin ? "(Admin)" : "(Veterinario)"}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {isAdmin && onchainEnabled() && !c.onchainId && (
                  <button className="btn-sm gold" onClick={doRegisterOnchain}>
                    Registrar caso on-chain
                  </button>
                )}
                {c.onchainId && (
                  <p className="muted" style={{ fontSize: 13 }}>
                    ⛓️ On-chain #{c.onchainId}
                    {c.closeTxHash && (
                      <>
                        {" · "}
                        <a href={`${ETHERSCAN_TX}${c.closeTxHash}`} target="_blank" rel="noreferrer" style={{ color: "var(--gold-dark)" }}>
                          cierre en Etherscan ↗
                        </a>
                      </>
                    )}
                  </p>
                )}
                {/* "Publicar caso" solo en modo simulacion; on-chain usa "Registrar caso on-chain" */}
                {isAdmin && c.status === "CREADO" && !onchainEnabled() && (
                  <button className="btn-sm primary" onClick={() => run(() => api.publish(c.id, current!.id), "Caso publicado")}>Publicar caso</button>
                )}
                {isAdmin && c.status === "FINANCIADO" && (
                  <button className="btn-sm primary" onClick={doFabricate}>Iniciar fabricación</button>
                )}
                {isAdmin && c.status === "EN_FABRICACION" && (
                  <button className="btn-sm primary" onClick={doInstall}>Marcar instalada</button>
                )}
                {isAdmin && ["PUBLICADO", "FINANCIADO"].includes(c.status) && (
                  <button className="btn-sm ghost" onClick={() => run(() => api.cancel(c.id, current!.id), "Caso cancelado")}>Cancelar caso</button>
                )}
                {isCaseVet && c.status === "INSTALADA" && (
                  <div>
                    <label>Clínica validadora</label>
                    <input className="form" style={{ padding: "10px 12px" }} value={clinic} onChange={(e) => setClinic(e.target.value)} placeholder="Centro Vet. Trujillo" />
                    <button
                      className="btn-sm gold"
                      style={{ marginTop: 10 }}
                      disabled={!clinic}
                      onClick={doValidate}
                    >
                      {chain ? "Validar y mintear NFTs" : "Validar y emitir NFTs"}
                    </button>
                  </div>
                )}
                {isAdmin && !["CREADO", "FINANCIADO", "EN_FABRICACION", "PUBLICADO"].includes(c.status) && (
                  <p className="muted">Sin acciones de admin en este estado.</p>
                )}
                {isCaseVet && c.status !== "INSTALADA" && (
                  <p className="muted">
                    {c.status === "CERRADO"
                      ? "Caso validado. NFTs de impacto ya emitidos."
                      : "Podrás validar y mintear los NFT cuando la prótesis esté instalada."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
