# VitalPaws — Backend

API REST + indexer de eventos + IPFS + auth SIWE. **El dinero nunca pasa por aquí**: donar/validar/refund son tx directas wallet→contrato desde el frontend. Este servicio solo indexa eventos y sirve datos off-chain.

## Stack
Node.js · Express · TypeScript · (Prisma + PostgreSQL, viem, SIWE, Pinata → se añaden en Fase 4).

## Estructura
```
backend/
├── src/
│   ├── index.ts          # bootstrap Express + healthcheck
│   └── routes/cases.ts   # endpoints de casos (placeholder)
└── contracts/            # Solidity + Hardhat (capa blockchain)
```

## Uso
```bash
cd backend
pnpm install
cp .env.example .env
pnpm dev            # http://localhost:4000/health
```

## Contratos
La lógica on-chain vive en [`contracts/`](contracts/) (Hardhat). Ver su README.
