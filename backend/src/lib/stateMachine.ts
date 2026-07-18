import type { CaseStatus } from "@prisma/client";

/**
 * Transiciones validas del ciclo de vida de un caso (CONTEXTO §5.2).
 * CREADO -> PUBLICADO -> FINANCIADO -> EN_FABRICACION -> INSTALADA -> CERRADO
 *              |            |
 *              +---------> CANCELADO
 */
export const TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  CREADO: ["PUBLICADO"],
  PUBLICADO: ["FINANCIADO", "CANCELADO"],
  FINANCIADO: ["EN_FABRICACION", "CANCELADO"],
  EN_FABRICACION: ["INSTALADA"],
  INSTALADA: ["CERRADO"],
  CERRADO: [],
  CANCELADO: [],
};

export function canTransition(from: CaseStatus, to: CaseStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}
