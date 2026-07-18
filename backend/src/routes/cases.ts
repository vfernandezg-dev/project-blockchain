import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { canTransition } from "../lib/stateMachine.js";
import { requireRole } from "../lib/auth.js";

export const casesRouter = Router();

/* ---------------- Lectura ---------------- */

// GET /cases?status=PUBLICADO
casesRouter.get("/", async (req, res) => {
  const status = req.query.status as string | undefined;
  const cases = await prisma.case.findMany({
    where: status ? { status: status as any } : undefined,
    include: { vet: true, _count: { select: { donations: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(cases);
});

// GET /cases/:id — ficha completa
casesRouter.get("/:id", async (req, res) => {
  const c = await prisma.case.findUnique({
    where: { id: req.params.id },
    include: {
      vet: true,
      donations: { include: { donor: true }, orderBy: { createdAt: "desc" } },
      certs: { include: { owner: true } },
    },
  });
  if (!c) return res.status(404).json({ error: "Caso no encontrado" });
  res.json(c);
});

/* ---------------- Paso 1-3: crear y publicar (ADMIN) ---------------- */

const createSchema = z.object({
  title: z.string().min(3),
  dogName: z.string().min(1),
  shelter: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  material: z.string().optional(),
  goalEth: z.number().positive(),
  diagnosis: z.string().optional(),
  vetId: z.string().min(1), // veterinario aliado del caso
});

casesRouter.post("/", requireRole("ADMIN"), async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const vet = await prisma.user.findUnique({ where: { id: parsed.data.vetId } });
  if (!vet || vet.role !== "VET") {
    return res.status(400).json({ error: "vetId debe ser un usuario con rol VET" });
  }

  const c = await prisma.case.create({
    data: { ...parsed.data, status: "CREADO" },
  });
  res.status(201).json(c);
});

casesRouter.post("/:id/publish", requireRole("ADMIN"), async (req, res) => {
  return transition(req, res, "PUBLICADO");
});

/* ---------------- Paso 4-5: donar (auto-financia) ---------------- */

const donateSchema = z.object({
  donorId: z.string().min(1),
  amountEth: z.number().positive(),
});

casesRouter.post("/:id/donate", async (req, res) => {
  const parsed = donateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const c = await prisma.case.findUnique({ where: { id: req.params.id } });
  if (!c) return res.status(404).json({ error: "Caso no encontrado" });
  if (c.status !== "PUBLICADO") {
    return res.status(409).json({ error: `No se puede donar en estado ${c.status}` });
  }
  const donor = await prisma.user.findUnique({ where: { id: parsed.data.donorId } });
  if (!donor) return res.status(400).json({ error: "Donante no encontrado" });

  const amount = parsed.data.amountEth;
  const newRaised = Number((c.raisedEth + amount).toFixed(6));
  const reachedGoal = newRaised >= c.goalEth;

  // txHash SIMULADO (Etapa A). En Etapa B viene de la tx real.
  const txHash = `sim-0x${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`;

  const [donation, updated] = await prisma.$transaction([
    prisma.donation.create({
      data: { caseId: c.id, donorId: donor.id, amountEth: amount, txHash },
    }),
    prisma.case.update({
      where: { id: c.id },
      data: { raisedEth: newRaised, status: reachedGoal ? "FINANCIADO" : "PUBLICADO" },
    }),
  ]);

  res.status(201).json({ donation, case: updated, reachedGoal });
});

/* ---------------- Paso 6-7: fabricar / instalar (ADMIN) ---------------- */

casesRouter.post("/:id/fabricate", requireRole("ADMIN"), async (req, res) => {
  return transition(req, res, "EN_FABRICACION");
});

casesRouter.post("/:id/install", requireRole("ADMIN"), async (req, res) => {
  return transition(req, res, "INSTALADA");
});

/* ---------------- Paso 8-9: validar (VET) -> cierra y emite certificados ---------------- */

const validateSchema = z.object({
  evidenceUrl: z.string().url().optional(),
  clinic: z.string().min(1),
});

casesRouter.post("/:id/validate", requireRole("VET"), async (req, res) => {
  const parsed = validateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const c = await prisma.case.findUnique({
    where: { id: req.params.id },
    include: { donations: true },
  });
  if (!c) return res.status(404).json({ error: "Caso no encontrado" });
  if (c.vetId !== req.actor!.id) {
    return res.status(403).json({ error: "Solo el veterinario asignado puede validar" });
  }
  if (!canTransition(c.status, "CERRADO")) {
    return res.status(409).json({ error: `No se puede validar en estado ${c.status}` });
  }

  // Un certificado (NFT simulado) por donante unico del caso.
  const donorIds = [...new Set(c.donations.map((d) => d.donorId))];
  const lastCert = await prisma.certificate.findFirst({ orderBy: { tokenId: "desc" } });
  let tokenId = (lastCert?.tokenId ?? 0) + 1;

  const certData = donorIds.map((ownerId) => {
    const donated = c.donations
      .filter((d) => d.donorId === ownerId)
      .reduce((s, d) => s + d.amountEth, 0);
    const metadata = JSON.stringify({
      name: `VitalPaws Impact Certificate #${tokenId}`,
      description: `Protesis (${c.material}) fabricada e instalada para '${c.dogName}'.`,
      attributes: [
        { trait_type: "Caso", value: c.title },
        { trait_type: "Material", value: c.material },
        { trait_type: "Clinica Validadora", value: parsed.data.clinic },
        { trait_type: "Monto Aportado", value: `${donated} ETH` },
        { trait_type: "Fecha de Cierre", value: new Date().toISOString().slice(0, 10) },
      ],
    });
    return { caseId: c.id, ownerId, tokenId: tokenId++, metadata };
  });

  await prisma.$transaction([
    ...certData.map((data) => prisma.certificate.create({ data })),
    prisma.case.update({
      where: { id: c.id },
      data: {
        status: "CERRADO",
        evidenceUrl: parsed.data.evidenceUrl,
        clinic: parsed.data.clinic,
      },
    }),
  ]);

  const result = await prisma.case.findUnique({
    where: { id: c.id },
    include: { certs: { include: { owner: true } } },
  });
  res.json({ case: result, certificatesMinted: certData.length });
});

/* ---------------- Cancelar / reembolso ---------------- */

casesRouter.post("/:id/cancel", requireRole("ADMIN"), async (req, res) => {
  return transition(req, res, "CANCELADO");
});

// Reembolso simulado: devuelve lo aportado por un donante en un caso CANCELADO.
casesRouter.post("/:id/refund", async (req, res) => {
  const donorId = z.string().min(1).safeParse(req.body?.donorId);
  if (!donorId.success) return res.status(400).json({ error: "donorId requerido" });

  const c = await prisma.case.findUnique({ where: { id: req.params.id } });
  if (!c) return res.status(404).json({ error: "Caso no encontrado" });
  if (c.status !== "CANCELADO") {
    return res.status(409).json({ error: "Solo se reembolsa en casos CANCELADOS" });
  }
  const agg = await prisma.donation.aggregate({
    where: { caseId: c.id, donorId: donorId.data },
    _sum: { amountEth: true },
  });
  res.json({ donorId: donorId.data, refundedEth: agg._sum.amountEth ?? 0, simulated: true });
});

/* ---------------- helper de transicion ---------------- */

async function transition(req: any, res: any, to: any) {
  const c = await prisma.case.findUnique({ where: { id: req.params.id } });
  if (!c) return res.status(404).json({ error: "Caso no encontrado" });
  if (!canTransition(c.status, to)) {
    return res.status(409).json({ error: `Transicion invalida ${c.status} -> ${to}` });
  }
  const updated = await prisma.case.update({ where: { id: c.id }, data: { status: to } });
  res.json(updated);
}
