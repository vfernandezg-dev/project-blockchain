# VitalPaws — Frontend (DApp)

Interfaz Web3. Lista de **casos financiables**, ficha de caso con **donación cripto** (tx directa wallet→contrato), rastreador de los 9 pasos y panel del donante con sus **NFTs de impacto**.

## Stack
Next.js (App Router) · TypeScript · CSS con la identidad del mockup · (wagmi + viem + RainbowKit → se añaden en Fase 5).

## Identidad visual (del mockup)
Paleta en [`src/app/globals.css`](src/app/globals.css): navy `#1e2a3a`, dorado `#c9a876`, fondo `#f5f6f8`.

## Uso
```bash
cd frontend
pnpm install
cp .env.local.example .env.local
pnpm dev            # http://localhost:3000
```

## Estructura
```
frontend/
└── src/app/
    ├── layout.tsx    # nav + shell
    ├── page.tsx      # home (hero)
    └── globals.css   # tokens de diseño (paleta del mockup)
```

> Estado: **scaffold** Fase 1. Wallet, casos y donación → fases 5–8.
