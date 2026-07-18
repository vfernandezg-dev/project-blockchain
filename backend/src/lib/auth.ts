import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";
import { prisma } from "../db.js";

/**
 * Auth ligera de Etapa A: el cliente envia el header `x-user-id`.
 * En la Etapa B esto se reemplaza por SIWE (firma de wallet).
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      actor?: { id: string; role: Role; name: string; wallet: string };
    }
  }
}

export function requireRole(...roles: Role[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.header("x-user-id");
    if (!userId) {
      return res.status(401).json({ error: "Falta header x-user-id" });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    if (roles.length && !roles.includes(user.role)) {
      return res
        .status(403)
        .json({ error: `Requiere rol ${roles.join(" o ")}, tienes ${user.role}` });
    }
    req.actor = { id: user.id, role: user.role, name: user.name, wallet: user.wallet };
    next();
  };
}
