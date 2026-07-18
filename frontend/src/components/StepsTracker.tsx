import { STEPS, type CaseStatus } from "@/lib/api";

const ORDER: CaseStatus[] = [
  "CREADO",
  "PUBLICADO",
  "FINANCIADO",
  "EN_FABRICACION",
  "INSTALADA",
  "CERRADO",
];

export function StepsTracker({ status }: { status: CaseStatus }) {
  if (status === "CANCELADO") {
    return <div className="alert err">Caso cancelado — los donantes pueden solicitar reembolso.</div>;
  }
  const currentIdx = ORDER.indexOf(status);
  return (
    <div className="steps">
      {STEPS.map((s, i) => {
        const cls = i < currentIdx ? "done" : i === currentIdx ? "current" : "";
        return (
          <div key={s.status} className={`step ${cls}`}>
            <span className="dot">{i < currentIdx ? "✓" : i + 1}</span>
            {s.label}
          </div>
        );
      })}
    </div>
  );
}
