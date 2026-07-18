import { Router } from "express";
import { prisma } from "../db.js";

export const certificatesRouter = Router();

// GET /certificates?ownerId=...  (NFTs de impacto — simulados en Etapa A)
certificatesRouter.get("/", async (req, res) => {
  const ownerId = req.query.ownerId as string | undefined;
  const certs = await prisma.certificate.findMany({
    where: ownerId ? { ownerId } : undefined,
    include: { case: true, owner: true },
    orderBy: { tokenId: "asc" },
  });
  // metadata viene como string JSON: lo parseamos para el cliente
  res.json(
    certs.map((c) => ({ ...c, metadata: JSON.parse(c.metadata) })),
  );
});
