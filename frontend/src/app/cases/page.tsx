"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Case } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listCases()
      .then(setCases)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container">
      <div className="page-head">
        <h2>Casos veterinarios</h2>
        <p>Elige un caso, revisa su avance y apoya con una donación cripto trazable.</p>
      </div>

      {loading ? (
        <div className="grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton card-skel" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🐾</div>
          <p>Aún no hay casos publicados. Vuelve pronto.</p>
        </div>
      ) : (
        <div className="grid">
          {cases.map((c) => {
            const pct = Math.min(100, Math.round((c.raisedEth / c.goalEth) * 100));
            return (
              <Link key={c.id} href={`/cases/${c.id}`} className="card">
                {c.imageUrl ? (
                  <img className="card-img" src={c.imageUrl} alt={c.dogName} />
                ) : (
                  <div className="img-placeholder">🐾</div>
                )}
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <StatusBadge status={c.status} />
                    <span className="muted">{c._count?.donations ?? 0} donaciones</span>
                  </div>
                  <h3>{c.title}</h3>
                  <p className="muted">{c.shelter}</p>
                  <div className="progress">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <strong style={{ color: "var(--navy)" }}>
                      {c.raisedEth} / {c.goalEth} ETH
                    </strong>
                    <span className="muted">{pct}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
