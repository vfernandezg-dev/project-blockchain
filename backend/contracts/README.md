# VitalPaws — Contratos (Hardhat)

Capa de liquidación on-chain. Custodia de fondos por caso + emisión del NFT de Impacto.

## Contratos previstos (Fase 2)
- **`Cases.sol`** — ciclo de vida del caso (crear/publicar/donar/estados/refund). Custodia el ETH donado.
- **`ImpactNFT.sol`** — ERC-721 (OpenZeppelin) acuñado al donante en el cierre.

## Uso
```bash
cd backend/contracts
pnpm install
cp .env.example .env        # RPC Sepolia + llave de deploy de PRUEBA
pnpm compile
pnpm test
pnpm deploy:sepolia
```

## Seguridad (foco QA en Testnet)
Reentrancy (`ReentrancyGuard`), control de estados (no saltar pasos), `onlyOwner`/`onlyVet` (AccessControl). Ver CONTEXTO-PROYECTO.md §5 y §8.

> Estado actual: **esqueleto**. La implementación completa es la Fase 2 del roadmap.
