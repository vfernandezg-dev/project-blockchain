import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <section className="hero">
        <div>
          <span className="badge">Piloto · App funcional (Etapa A)</span>
          <h1>Cada Paso, Una Nueva Oportunidad</h1>
          <p>
            Financiamos, fabricamos y entregamos prótesis caninas personalizadas
            mediante escaneo e impresión 3D. Cada donación queda registrada de
            forma trazable, verificable e inmutable — desde tu aporte hasta la
            prótesis instalada y tu NFT de impacto.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/cases"><button className="btn-primary">Ver Casos</button></Link>
            <Link href="/dashboard"><button className="btn-outline">Mi Panel</button></Link>
          </div>
        </div>
        <div className="hero-card">
          <img className="hero-logo" src="/logo-full.png" alt="VitalPaws" />
          <p style={{ marginTop: 16, color: "var(--text-muted)" }}>
            Donación → fabricación 3D → prótesis instalada → NFT de impacto.
          </p>
        </div>
      </section>

      <section style={{ paddingBottom: 64 }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          <div className="panel"><h3>🔬 Impresión 3D</h3><p className="muted">Prótesis a medida con filamento de grado médico (TPU/PETG), validadas por veterinarios.</p></div>
          <div className="panel"><h3>🔗 Trazabilidad</h3><p className="muted">Cada caso avanza por 9 pasos verificables: desde el registro hasta la validación clínica.</p></div>
          <div className="panel"><h3>🏅 NFT de Impacto</h3><p className="muted">Al cerrarse un caso, cada donante recibe un certificado de impacto único.</p></div>
        </div>
      </section>
    </main>
  );
}
