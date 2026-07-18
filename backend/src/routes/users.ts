import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

export const usersRouter = Router();

const createUserSchema = z.object({
  wallet: z.string().min(3).transform((w) => w.toLowerCase()),
  name: z.string().min(1),
  role: z.enum(["ADMIN", "VET", "DONANTE"]).default("DONANTE"),
});

// Lista de usuarios (para el selector "actuar como" del frontend en Etapa A)
usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  res.json(users);
});

usersRouter.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      donations: { include: { case: true } },
      certs: { include: { case: true } },
    },
  });
  if (!user) return res.status(404).json({ error: "No encontrado" });
  res.json(user);
});

usersRouter.post("/", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const user = await prisma.user.create({ data: parsed.data });
    res.status(201).json(user);
  } catch {
    res.status(409).json({ error: "wallet ya registrada" });
  }
});

// Login por wallet (MetaMask): encuentra o crea un DONANTE con esa direccion.
const walletLoginSchema = z.object({
  wallet: z.string().min(3),
  name: z.string().optional(),
});

usersRouter.post("/wallet", async (req, res) => {
  const parsed = walletLoginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const wallet = parsed.data.wallet.toLowerCase();
  let user = await prisma.user.findUnique({ where: { wallet } });
  if (!user) {
    const short = wallet.startsWith("0x")
      ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
      : wallet;
    user = await prisma.user.create({
      data: { wallet, name: parsed.data.name || short, role: "DONANTE" },
    });
  }
  res.json(user);
});
