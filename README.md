# VitalPaws 🐾

Ecosistema **Web3 de impacto social** para financiar, fabricar y entregar **prótesis caninas** personalizadas (escaneo + impresión 3D) mediante **donación cripto trazable** y un **NFT de Impacto** que certifica el caso. Piloto sobre **Ethereum Sepolia**.

Curso: *Blockchain Aplicado a Sistemas Empresariales* — UPAO 2026 · **Grupo 02**.

> - Contexto, alcance y decisiones de diseño: **[CONTEXTO-PROYECTO.md](CONTEXTO-PROYECTO.md)**
> - Cómo desplegar los contratos: **[MANUAL-DESPLIEGUE.md](MANUAL-DESPLIEGUE.md)**
> - Cómo usar la app: **[MANUAL-USUARIO.md](MANUAL-USUARIO.md)**

---

## 1. El proyecto

Las donaciones tradicionales sufren de falta de transparencia y comisiones. VitalPaws usa blockchain para que **cada aporte sea rastreable e inmutable**, desde la donación hasta la prótesis instalada. Combina una parte **física** (impresión 3D con filamento médico TPU/PETG) y una **digital** (financiamiento y certificación on-chain).

**Ciclo de vida de un caso — 9 pasos:**

```
1 Solicitud → 2 Diagnóstico (vet) → 3 Publicación → 4 Donación (ETH) → 5 Financiado
→ 6 Fabricación 3D → 7 Instalación → 8 Validación (vet) → 9 Cierre + NFT al donante
```

Máquina de estados: `CREADO → PUBLICADO → FINANCIADO → EN_FABRICACION → INSTALADA → CERRADO` (+ `CANCELADO` con reembolso).

**Roles (identidad = wallet):**
- **ADMIN** = *owner* del contrato: crea/publica casos, fabrica, instala.
- **VET** = veterinario del caso: única wallet que puede validar y disparar el mint del NFT.
- **DONANTE** = cualquier wallet: aporta ETH y recibe el NFT al cierre.

## 2. Alcance del piloto (recortado por feedback del docente)

- ✅ **Donación cripto por caso** (wallet → smart contract, ETH real en Sepolia).
- ✅ **Ciclo de 9 pasos** con estados on-chain.
- ✅ **NFT de Impacto** (ERC-721) minteado al donante al cerrar el caso.
- ⏸️ **ICO / Tokenomics / DAO / $PAWS** → segunda etapa (documentado, no implementado).

## 3. Arquitectura y stack

Dos carpetas independientes; los contratos viven dentro del backend (capa blockchain).

```
proyecto/
├── frontend/                 # DApp — Next.js 15 + TypeScript + ethers v6 + MetaMask
│   └── src/
│       ├── app/              # páginas: casos, ficha, dashboard, admin, login
│       └── lib/              # api.ts, eth.ts, contracts.ts, session.tsx
├── backend/                  # API — Node.js + Express + Prisma (SQLite)
│   ├── src/                  # rutas: cases, users, certificates
│   ├── prisma/               # schema + seed
│   └── contracts/            # Solidity — ImpactNFT.sol + VitalPawsCases.sol (Remix)
├── mockup/                   # capturas del mockup (identidad visual de referencia)
├── capturas/                 # imágenes de los manuales (deploy + app)
├── guia/                     # material del curso (código del profesor)
├── CONTEXTO-PROYECTO.md · MANUAL-DESPLIEGUE.md · MANUAL-USUARIO.md
```

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15 · TypeScript · CSS (paleta del mockup) |
| Web3 | **ethers.js v6 + MetaMask** (estilo de la guía del curso) |
| Backend | Node.js · Express · **Prisma + SQLite** |
| Contratos | **Solidity 0.8.20 · OpenZeppelin v5** · compilados/desplegados en **Remix** |
| Red | **Ethereum Sepolia** (testnet) |

**Enfoque híbrido:** on-chain = donación ETH + mint del NFT; el backend guarda el contenido del caso (fotos, diagnóstico) y refleja los estados. Si no hay contratos configurados, la app funciona en **modo simulación** (mismo flujo, sin MetaMask).

## 4. Requisitos

- Node.js ≥ 20 · pnpm ≥ 11
- MetaMask con red **Sepolia** y ETH de faucet (para el modo on-chain)

## 5. Puesta en marcha

```bash
# Backend  →  http://localhost:4000
cd backend && pnpm install && cp .env.example .env && pnpm run dev

# Frontend →  http://localhost:3000
cd frontend && pnpm install && cp .env.local.example .env.local && pnpm run dev
```

Usuarios de ejemplo (seed): **Admin**, **Veterinario**, **Donante** — accesibles por los botones demo del login o conectando MetaMask.

### Activar el modo on-chain (Ethereum real)

1. Desplegar los contratos en **Remix** (ver [MANUAL-DESPLIEGUE.md](MANUAL-DESPLIEGUE.md)):
   `ImpactNFT` → `VitalPawsCases(nftAddress)` → `ImpactNFT.setMinter(casesAddress)`.
2. Pegar las direcciones en `frontend/.env.local`:
   ```
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_CASES_ADDRESS=0x...
   NEXT_PUBLIC_IMPACT_NFT_ADDRESS=0x...
   ```
3. Reiniciar el frontend. El botón pasa de "Donar" a **"Donar con MetaMask"**.

**Despliegue de referencia (Sepolia):**
| Contrato | Dirección |
|----------|-----------|
| ImpactNFT | `0xB34bB13436c69A9DcD353Bac141131F80cC4FEFA` |
| VitalPawsCases | `0x5a8E5Ba06e6FF007d0a4c696f47374F66EeEabcF` |

## 6. Estado

- **Etapa A — App funcional** (backend + frontend con DB): ✅ completa.
- **Etapa B — Integración Ethereum** (Remix + ethers + MetaMask): ✅ probada end-to-end en Sepolia (donación real → mint de NFT).
- Pendiente/opcional: IPFS para metadatos, indexer de eventos, SIWE, y la 2ª etapa (ICO/DAO).

Roadmap detallado en [CONTEXTO-PROYECTO.md](CONTEXTO-PROYECTO.md).

## 7. Integrantes (Grupo 02)

- Fernandez Gutierrez Valentin 
- Leon Rojas Franco
- Morales Benites Charlie
- Moreno Quevedo Camila
- Sanchez Chuquimango Diego
- Sanchez Romero Leonardo

Docente: Ing. Luis Jose Flores Rodriguez.
