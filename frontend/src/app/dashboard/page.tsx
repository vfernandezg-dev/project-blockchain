"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Certificate, type Donation } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function Dashboard() {
  const { current } = useSession();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [certs, setCerts] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!current) return;
    api.getUser(current.id).then((u) => setDonations(u.donations ?? []));
    api.listCertificates(current.id).then(setCerts);
  }, [current]);

  if (!current)
    return (
      <main className="container">
        <div className="page-head">
          <h2>Mi Panel</h2>
        </div>
        <div className="empty-state">
          <div className="icon">🔒</div>
          <p style={{ marginBottom: 16 }}>Conéctate para ver tus donaciones y NFTs de impacto.</p>
          <Link href="/login"><button className="btn-primary">Conectar cuenta</button></Link>
        </div>
      </main>
    );

  const totalDonated = donations.reduce((s, d) => s + d.amountEth, 0);

  return (
    <main className="container">
      <div className="page-head" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span className="avatar" style={{ width: 52, height: 52, fontSize: 22 }}>
          {current.name.charAt(0).toUpperCase()}
        </span>
        <div>
          <h2>Hola, {current.name}</h2>
          <p>Rol: {current.role} · {current.wallet}</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
        <div className="panel"><h3>{totalDonated.toFixed(3)} ETH</h3><p className="muted">Total donado</p></div>
        <div className="panel"><h3>{donations.length}</h3><p className="muted">Donaciones</p></div>
        <div className="panel"><h3>{certs.length}</h3><p className="muted">NFTs de impacto</p></div>
      </div>

      <div className="page-head"><h2 style={{ fontSize: 22 }}>Mis donaciones</h2></div>
      <div className="panel">
        {donations.length === 0 ? (
          <p className="muted">Aún no has donado. <Link href="/cases">Ver casos →</Link></p>
        ) : (
          donations.map((d) => (
            <div key={d.id} className="donation-item">
              <span>{d.case?.title ?? "Caso"}</span>
              <span><strong>{d.amountEth} ETH</strong> <span className="muted">· {d.txHash.slice(0, 12)}…</span></span>
            </div>
          ))
        )}
      </div>

      <div className="page-head"><h2 style={{ fontSize: 22 }}>Mis NFTs de Impacto</h2></div>
      {certs.length === 0 ? (
        <div className="panel"><p className="muted">Recibirás un NFT cuando un caso que apoyaste se cierre.</p></div>
      ) : (
        <div className="grid">
          {certs.map((cert) => (
            <div key={cert.id} className="cert">
              <h4>{cert.metadata.name}</h4>
              <p style={{ color: "#cbd5e1", fontSize: 14, marginBottom: 8 }}>{cert.metadata.description}</p>
              {cert.metadata.attributes.map((a, i) => (
                <div key={i} className="attr"><span>{a.trait_type}</span><span>{a.value}</span></div>
              ))}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
