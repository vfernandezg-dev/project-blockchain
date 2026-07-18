# VitalPaws 🐾

Ecosistema **Web3 de impacto social** para financiar, fabricar y entregar **prótesis caninas** personalizadas mediante donación cripto trazable y **NFT de impacto**. Piloto sobre **Ethereum Sepolia**.

> Contexto completo, alcance y decisiones de diseño: **[CONTEXTO-PROYECTO.md](CONTEXTO-PROYECTO.md)**.
> Mockup de referencia (identidad visual): carpeta **[mockup/](mockup/)**.

Curso: *Blockchain Aplicado a Sistemas Empresariales* — UPAO 2026 · Grupo 02.

## Alcance del piloto (recortado)
- ✅ Donación **cripto por caso** (wallet → smart contract).
- ✅ Ciclo de vida de un caso en **9 pasos** (registro → validación → NFT).
- ✅ **NFT de Impacto** (ERC-721) al cierre.
- ⏸️ ICO / Tokenomics / DAO / $PAWS → **segunda etapa** (documentado, no implementado).

## Estructura (dos carpetas)

```
proyecto/
├── frontend/             # DApp — Next.js + wagmi/viem (identidad del mockup)
├── backend/              # API — Node.js + Express (REST + indexer + IPFS + SIWE)
│   └── contracts/        # Solidity — Hardhat (Cases.sol, ImpactNFT.sol)
├── mockup/               # Capturas del mockup (identidad visual)
└── CONTEXTO-PROYECTO.md
```

Cada carpeta es un proyecto **independiente** (su propio `package.json` e install). El **frontend** y el **backend** se levantan por separado; los contratos viven dentro del backend (capa blockchain).

**Principio:** el dinero nunca pasa por el backend. Donar/validar = tx directa wallet→contrato. El backend solo indexa eventos y gestiona datos off-chain (IPFS).

## Requisitos
- Node.js ≥ 20
- pnpm ≥ 11

## Puesta en marcha
```bash
# Backend (API)
cd backend && pnpm install && cp .env.example .env && pnpm dev      # http://localhost:4000

# Contratos (Hardhat)
cd backend/contracts && pnpm install && cp .env.example .env        # pnpm compile / test / deploy:sepolia

# Frontend (DApp)
cd frontend && pnpm install && cp .env.local.example .env.local && pnpm dev   # http://localhost:3000
```

## Estado
Fase 1 — **scaffold del monorepo**. Ver roadmap en [CONTEXTO-PROYECTO.md](CONTEXTO-PROYECTO.md#11-arranque-paso-a-paso-roadmap-de-implementación).
