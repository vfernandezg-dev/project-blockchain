const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type Role = "ADMIN" | "VET" | "DONANTE";
export type CaseStatus =
  | "CREADO"
  | "PUBLICADO"
  | "FINANCIADO"
  | "EN_FABRICACION"
  | "INSTALADA"
  | "CERRADO"
  | "CANCELADO";

export interface User {
  id: string;
  wallet: string;
  name: string;
  role: Role;
}

export interface Donation {
  id: string;
  amountEth: number;
  txHash: string;
  wallet?: string | null;
  createdAt: string;
  donor?: User;
  case?: Case;
}

export interface Certificate {
  id: string;
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    attributes: { trait_type: string; value: string }[];
  };
  case?: Case;
  owner?: User;
}

export interface Case {
  id: string;
  title: string;
  dogName: string;
  shelter: string;
  description: string;
  imageUrl?: string | null;
  material: string;
  goalEth: number;
  raisedEth: number;
  status: CaseStatus;
  onchainId?: number | null;
  closeTxHash?: string | null;
  diagnosis?: string | null;
  evidenceUrl?: string | null;
  clinic?: string | null;
  vet?: User | null;
  vetId?: string | null;
  donations?: Donation[];
  certs?: Certificate[];
  _count?: { donations: number };
}

async function req<T>(
  path: string,
  opts: { method?: string; body?: unknown; actorId?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.actorId) headers["x-user-id"] = opts.actorId;
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error ? JSON.stringify(data.error) : `Error ${res.status}`);
  return data as T;
}

export const api = {
  // usuarios
  listUsers: () => req<User[]>("/users"),
  loginWallet: (wallet: string, name?: string) =>
    req<User>("/users/wallet", { method: "POST", body: { wallet, name } }),
  getUser: (id: string) =>
    req<User & { donations: Donation[]; certs: Certificate[] }>(`/users/${id}`),

  // casos
  listCases: (status?: CaseStatus) => req<Case[]>(`/cases${status ? `?status=${status}` : ""}`),
  getCase: (id: string) => req<Case>(`/cases/${id}`),
  createCase: (body: unknown, actorId: string) =>
    req<Case>("/cases", { method: "POST", body, actorId }),
  publish: (id: string, actorId: string) =>
    req<Case>(`/cases/${id}/publish`, { method: "POST", actorId }),
  donate: (
    id: string,
    donorId: string,
    amountEth: number,
    onchain?: { txHash: string; wallet: string },
  ) =>
    req<{ case: Case; reachedGoal: boolean }>(`/cases/${id}/donate`, {
      method: "POST",
      body: { donorId, amountEth, ...onchain },
    }),
  linkOnchain: (id: string, onchainId: number, actorId: string) =>
    req<Case>(`/cases/${id}/onchain`, { method: "POST", body: { onchainId }, actorId }),
  fabricate: (id: string, actorId: string) =>
    req<Case>(`/cases/${id}/fabricate`, { method: "POST", actorId }),
  install: (id: string, actorId: string) =>
    req<Case>(`/cases/${id}/install`, { method: "POST", actorId }),
  validate: (
    id: string,
    actorId: string,
    body: { clinic: string; evidenceUrl?: string; txHash?: string },
  ) =>
    req<{ case: Case; certificatesMinted: number }>(`/cases/${id}/validate`, {
      method: "POST",
      body,
      actorId,
    }),
  cancel: (id: string, actorId: string) =>
    req<Case>(`/cases/${id}/cancel`, { method: "POST", actorId }),

  // certificados
  listCertificates: (ownerId?: string) =>
    req<Certificate[]>(`/certificates${ownerId ? `?ownerId=${ownerId}` : ""}`),
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  CREADO: "Creado",
  PUBLICADO: "Publicado",
  FINANCIADO: "Financiado",
  EN_FABRICACION: "En fabricación",
  INSTALADA: "Instalada",
  CERRADO: "Cerrado",
  CANCELADO: "Cancelado",
};

// Los 9 pasos para el rastreador visual
export const STEPS: { status: CaseStatus; label: string }[] = [
  { status: "CREADO", label: "Creado" },
  { status: "PUBLICADO", label: "Publicado" },
  { status: "FINANCIADO", label: "Financiado" },
  { status: "EN_FABRICACION", label: "Fabricación" },
  { status: "INSTALADA", label: "Instalada" },
  { status: "CERRADO", label: "Cerrado" },
];
