# VitalPaws — Contexto del Proyecto y Alcance de Implementación

> Documento de contexto que consolida el Whitepaper, el Plan de Implementación y Arquitectura Transaccional, y los ajustes/mejoras solicitados por el docente (feedback `Grupo02.txt`). Sirve como fuente única de verdad para lo que **se va a construir**.

**Curso:** Blockchain Aplicado a Sistemas Empresariales — UPAO, Ingeniería de Sistemas e IA
**Grupo 02 — Integrantes:** Fernandez Gutierrez Valentin, Leon Rojas Franco, Morales Benites Charlie, Moreno Quevedo Camila, Sanchez Chuquimango Diego, Sanchez Romero Leonardo
**Docente:** Ing. Luis Jose Flores Rodriguez · Trujillo, 2026

---

## 1. Qué es VitalPaws

Ecosistema **Web3 de impacto social** para financiar, fabricar y entregar **prótesis caninas personalizadas** mediante escaneo e impresión 3D.

**Problema:** familias y refugios no acceden a prótesis veterinarias por costo alto, falta de proveedores y dificultad para financiar tratamientos.

**Solución (dos capas):**
- **Física:** impresión 3D (filamentos TPU / PETG grado médico) → prótesis adaptadas a anatomía de cada perro, a bajo costo.
- **Digital (blockchain):** financiamiento transparente, global, verificable. Cada donación y uso de fondos queda registrado público e inmutable → trazabilidad del dinero desde el aporte hasta la entrega.

**Por qué Web3:** elimina la "caja negra" de las donaciones, reduce intermediarios/comisiones bancarias, habilita microdonaciones internacionales, y añade gobernanza comunitaria vía token **$PAWS**.

**Misión corto plazo:** programa piloto → primeras prótesis validando materiales, comodidad y viabilidad.
**Visión largo plazo:** red veterinaria descentralizada global (donantes, refugios, clínicas, fabricantes 3D, comunidad Web3).

---

## 2. Stack técnico definido

| Capa | Tecnología |
|------|-----------|
| Frontend (DApp) | Next.js + TypeScript (SSR/SSG) |
| Backend / Orquestación | Node.js (API REST, procesos async) |
| Blockchain | Solidity sobre Ethereum (o L2 Polygon/Arbitrum para reducir gas) |
| Almacenamiento descentralizado | IPFS (evidencia + metadatos NFT) |
| Testnet | Sepolia |

---

## 3. Token $PAWS (Tokenomics — referencia)

- **Suministro total:** 100,000,000 (emisión fija, anti-inflación).
- **Modelo económico:** circular — usuarios compran token para financiar prótesis / productos / beneficios → recursos se reinvierten en nueva producción.
- **Utilidad:** gobernanza DAO (voto sobre refugios/casos), descuentos en clínicas aliadas, acceso VIP (Tier System), NFTs de impacto.
- **Mecanismo de valor:** deflacionario (quema de % en ciertas transacciones) + parte a tesorería.

> ⚠️ Ver Sección 6 — la lógica de ICO/Tokenomics **NO se implementa** en esta etapa; queda como especificación de segunda etapa.

---

## 4. ⭐ FEEDBACK DEL DOCENTE — Ajustes obligatorios (`Grupo02.txt`)

El docente indicó que la arquitectura original es **demasiado compleja y difícil de implementar**. Se debe **reducir alcance** y **mejorar la descripción del escenario real**. Resumen de las tres directivas:

### 4.1. Reducir alcance
- ✅ Contemplar **solo el escenario de donación por Flujo Cripto**.
- ❌ **No implementar** la lógica de la **ICO** → dejarla **especificada como segunda etapa**.
- ❌ **Abandonar** en la implementación todo el flujo de distribución de tesorería/liquidez/marketing/vesting (incrementa dificultad).

### 4.2. Mejorar el escenario real (los 9 pasos)
El docente pide detallar el ciclo completo respondiendo preguntas concretas. **Estos 9 pasos REEMPLAZAN la antigua "Fase 2.3: Validación y Certificación"** del plan, porque en la versión original "no se conectan los puntos".

### 4.3. Revisión de participantes
- Volver a revisar los participantes del ecosistema.
- Determinar su **mapa de confianza y desconfianza** según las diapositivas mostradas.

---

## 5. ⭐ Escenario real a implementar — Ciclo de vida de un caso (9 pasos)

Diseño **resuelto y mínimo**: solo lo necesario para que la lógica conecte de punta a punta. Se toman decisiones concretas para cerrar las preguntas del docente, evitando actores y mecanismos que aumenten complejidad.

### 5.0. Decisiones de diseño (para mantenerlo simple pero coherente)

1. **Solo 4 roles reales.** Se colapsa "veterinario diagnóstico", "instalador" y "validador" en **un único Veterinario Aliado** (misma clínica de principio a fin → continuidad clínica y un solo responsable). El **laboratorio 3D es operado por la propia VitalPaws** → no se introduce un "fabricante externo" como nuevo actor.
2. **Datos personales NO van a la blockchain.** On-chain solo va: `caseId`, monto objetivo, montos donados, direcciones (wallets), estados y **hashes** de la evidencia. Fotos, expediente clínico y descripciones viven **off-chain en IPFS**; on-chain se guarda el hash IPFS → inmutable y verificable sin exponer datos privados.
3. **Un solo NFT, al cierre.** No se mintea NFT al alcanzar la meta (Paso 5); solo se cambia de estado. El **NFT de Impacto se emite una única vez en el cierre (Paso 9)**, cuando existe impacto real validado. Esto conecta los puntos: el certificado prueba que el aporte se transformó en una prótesis instalada.
4. **Sin $PAWS en esta etapa.** El token $PAWS, sus recompensas, votación y descuentos son **segunda etapa** (ver Sección 6). El incentivo del donante en el piloto es el **NFT de Impacto** (certificado ESG coleccionable), no tokens.
5. **Sin multi-firma en el piloto.** Los fondos quedan custodiados por el contrato del caso y se liberan a la **wallet de producción de VitalPaws** al alcanzar la meta. La multi-firma (50/20/15/10/5) queda como segunda etapa.

### 5.1. Actores (4)

| Actor | Rol |
|-------|-----|
| **Solicitante** (refugio o dueño) | Pide ayuda para un caso (Paso 1). |
| **Veterinario Aliado** | Diagnostica y modela (Paso 2), instala (Paso 7) y valida/firma (Paso 8). Wallet **autorizada** en el contrato. |
| **Donante** (ej. Pedro) | Aporta ETH al caso (Paso 4) y recibe el NFT (Paso 9). |
| **VitalPaws (plataforma)** | Modera/publica casos (Paso 3), opera el laboratorio 3D (Paso 6) y administra el contrato. |

### 5.2. Máquina de estados del caso (on-chain)

```
CREADO ─▶ PUBLICADO ─▶ FINANCIADO ─▶ EN_FABRICACION ─▶ INSTALADA ─▶ CERRADO
              │           │                                   (Paso 9: mint NFT al donante)
              │     (recaudado ≥ meta)
              └─▶ CANCELADO   (expira/no llega a meta → donantes hacen refund)
```

### 5.3. Los 9 pasos — resueltos

| # | Paso | Quién actúa | Qué queda ON-CHAIN | Qué queda OFF-CHAIN (IPFS) |
|---|------|-------------|--------------------|-----------------------------|
| **1** | **Solicitud del caso** | Solicitante (refugio/dueño) | Nada aún (evita spam/datos personales en BC). | Formulario: datos del animal, fotos, contacto. |
| **2** | **Diagnóstico y modelo** | Veterinario Aliado (**misma clínica** todo el ciclo) | Al aprobar: `createCase(caseId, meta, ipfsHashExpediente, vet)` → estado **CREADO**. | Expediente clínico: diagnóstico, medidas, material, costo estimado. |
| **3** | **Publicación** | VitalPaws | `publishCase(caseId)` → estado **PUBLICADO**. Caso visible con meta y avance. | Ficha pública: fotos, historia, monto requerido. |
| **4** | **Donación (cripto)** | Donante | `donate(caseId)` *payable* → registra `{donante, monto, timestamp}`; actualiza `recaudado`. **No entrega $PAWS** (2ª etapa). | — |
| **5** | **Meta alcanzada** | Contrato (automático) | Si `recaudado ≥ meta` → estado **FINANCIADO**; se **cierra la donación**; fondos liberables a wallet de producción. **No mintea NFT aquí.** | — |
| **6** | **Fabricación** | VitalPaws (lab 3D propio) | `setEnFabricacion(caseId)` → estado **EN_FABRICACION**. **Sin actores nuevos.** | Registro de producción: escaneo 3D, CAD, parámetros de impresión (TPU/PETG). |
| **7** | **Instalación** | Veterinario Aliado (**el mismo del Paso 2**) | `setInstalada(caseId)` → estado **INSTALADA**. | Fotos/nota de la colocación. |
| **8** | **Validación** | Veterinario Aliado (**su wallet autorizada firma**) | `validar(caseId, ipfsHashEvidencia)` — solo callable por la wallet del vet del caso = **la firma es la validación**. | Evidencia: fotos de la prótesis instalada, reporte de que cumple las specs del Paso 2. |
| **9** | **Cierre** | Contrato → Donante | La validación dispara `mint` del **NFT de Impacto** al donante; estado **CERRADO**. | Metadatos del NFT (ver abajo). |

> **¿Cómo se valida la calidad (Paso 8)?** No hay un tercero externo: la clínica que diagnosticó (Paso 2) es la que instala (Paso 7) y firma la validación (Paso 8) con su **wallet autorizada** registrada en el caso. La firma on-chain de ese vet = garantía de que la prótesis cumple lo especificado. La blockchain no valida calidad física; **ancla de forma inmutable quién validó, cuándo y con qué evidencia**.

> **NFT de Impacto — un caso puede tener varios donantes.** En el cierre se emite **un NFT por donante** que aportó al caso, cada uno referenciando su `txHash` y monto. Es un certificado, no un activo especulativo.

**Ejemplo canónico (Paso 4):**
> Pedro ve la lista de casos, selecciona *"Prótesis de cadera para Firulais"*, revisa fotos, monto requerido y avance. Conecta su billetera y dona 0.03 ETH. La tx queda en blockchain y la app actualiza el recaudado. Al cerrarse el caso (prótesis instalada y validada), Pedro recibe su **NFT de Impacto**.

**Metadatos del NFT de Impacto (en IPFS):**
```json
{
  "name": "VitalPaws Impact Certificate #001",
  "description": "Prótesis de cadera de TPU fabricada e instalada para 'Firulais'.",
  "image": "ipfs://Qm...",
  "attributes": [
    { "trait_type": "Caso", "value": "caseId-001" },
    { "trait_type": "Material", "value": "TPU Grado Médico" },
    { "trait_type": "Clínica Validadora", "value": "Centro Veterinario Aliado - Trujillo" },
    { "trait_type": "Monto Aportado", "value": "0.03 ETH" },
    { "trait_type": "TxHash Donación", "value": "0x7f8c9b..." },
    { "trait_type": "Fecha de Cierre", "value": "2026-08-15" }
  ]
}
```

### 5.4. Superficie mínima del contrato (Solidity)

```
createCase(caseId, meta, ipfsHashExpediente, vetWallet)  // solo VitalPaws
publishCase(caseId)                                       // solo VitalPaws
donate(caseId) payable                                    // cualquiera → auto FINANCIADO al llegar a meta
setEnFabricacion(caseId) / setInstalada(caseId)           // solo VitalPaws
validar(caseId, ipfsHashEvidencia)                        // solo vetWallet del caso → mintea NFT + CERRADO
cancelCase(caseId)                                         // solo VitalPaws → estado CANCELADO
refund(caseId)                                             // donante recupera su aporte si CANCELADO
```
Guardas de seguridad para Testnet: control de estados (no saltar pasos), `onlyOwner`/`onlyVet`, y protección **reentrancy** en `donate` y en la liberación de fondos.

---

## 6. Alcance de implementación — IN / OUT

### ✅ SE IMPLEMENTA (esta etapa)
- Flujo de **donación cripto nativa** (wallet → contrato del caso → registro on-chain).
- Ciclo de vida de un caso (los **9 pasos** de la Sección 5).
- Registro/publicación de casos veterinarios en la DApp.
- Actualización de monto recaudado on-chain.
- Emisión de **NFT de Impacto** como registro de datos/metadatos (ID caso, fechas, monto) sobre IPFS.
- Trazabilidad on-chain del recorrido del fondo.
- Pruebas en **Testnet Sepolia**.

### ❌ NO SE IMPLEMENTA — queda como Segunda Etapa (especificado, no codificado)
- Lógica de **ICO** (fases Private/Pre-Sale/Public, precios, soft/hard cap).
- **Tokenomics** operativa: distribución del suministro, quema deflacionaria.
- **Enrutamiento de tesorería** multi-firma (50/20/15/10/5).
- **Vesting / cliff / bloqueo de liquidez**.
- Flujo **Fiat-to-crypto** (Izipay/Stripe, on-ramp) — Account Abstraction ERC-4337.
- Distribución tesorería/liquidez/marketing.

> Razón: reduce complejidad de implementación según directiva del docente. Todo lo anterior permanece documentado en el Whitepaper como visión de segunda etapa.

---

## 7. Participantes y mapa de confianza/desconfianza *(pendiente — Sección 4.3)*

Actores (reducidos a **4** en la Sección 5.1 para simplificar):

- **Solicitante** (refugio/dueño) — pide ayuda para el caso (Paso 1).
- **Veterinario Aliado** — diagnostica y modela (2), instala (7) y valida con firma on-chain (8). Wallet autorizada.
- **Donante** (ej. Pedro) — aporta ETH vía wallet (4), recibe NFT (9).
- **VitalPaws (plataforma)** — modera/publica (3), opera el laboratorio 3D propio (6), administra el contrato.
- *(El **Smart Contract** es la capa de custodia y registro, no un actor humano.)*

### 7.1. Mapa de confianza y desconfianza

Idea central: la blockchain **elimina la confianza sobre el dinero** (todo es verificable on-chain), pero **no elimina la confianza sobre el mundo físico** — que la prótesis se fabrique bien y se instale — porque eso ocurre fuera de la cadena. Ese límite es el **problema del oráculo**: alguien de confianza (el Veterinario) debe "firmar" que el hecho físico ocurrió.

| Relación | ¿Requiere confianza? | Cómo lo resuelve el proyecto |
|----------|----------------------|------------------------------|
| **Donante → dinero / VitalPaws** | ❌ Ya no (era la "caja negra") | **Trustless.** Fondos custodiados por el Smart Contract, no por VitalPaws. Trazabilidad on-chain: cualquiera ve cuánto entró, cuándo se liberó y a qué wallet. |
| **Donante → Smart Contract** | ⚠️ Confianza en el código | Contrato **inmutable y verificable**; se mitiga con **auditoría + pruebas en Testnet Sepolia** (reentrancy, estados). El código es la ley. |
| **Donante → que la prótesis exista y se instale** | ✅ Sí (mundo físico) | **Punto de confianza irreducible.** Se ancla con evidencia en IPFS + **firma on-chain del Veterinario** (Paso 8). La cadena no prueba la calidad; prueba **quién validó y con qué evidencia**. |
| **VitalPaws → Veterinario (diagnóstico correcto)** | ✅ Sí | Se mitiga con **convenios/acreditación**: solo vets aliados verificados reciben una **wallet autorizada** registrada en el contrato. |
| **Veterinario → VitalPaws (fabrica bien la prótesis)** | ✅ Sí | El vet valida el producto final antes de firmar (Paso 8). Si no cumple specs del Paso 2, **no firma** → el caso no cierra ni mintea NFT. |
| **Solicitante → VitalPaws + Veterinario** | ✅ Sí | Confía en que el caso será atendido; mitigado por la reputación pública on-chain (casos cerrados y verificables). |
| **Todos → estado de los fondos** | ❌ Ya no | El estado del caso (recaudado, FINANCIADO, CERRADO) es **público e inmutable**; nadie puede falsearlo. |

**Conclusión del mapa:** el proyecto convierte la confianza sobre el **dinero** en verificación automática (trustless), y **concentra la confianza restante en un único punto acreditado — el Veterinario Aliado** — que actúa como oráculo del mundo físico. Reducir a un solo validador acreditado es lo que mantiene el modelo simple sin perder trazabilidad.

### 7.2. Dudas de diseño resueltas (supuestos cerrados)

| Duda | Decisión |
|------|----------|
| **Moneda de donación** | **ETH** sobre Testnet **Sepolia** (piloto). USDT/USDC y fiat → 2ª etapa. |
| **Cómo se fija la meta del caso** | El Veterinario estima el costo en el Paso 2; VitalPaws lo convierte a ETH al crear el caso (`meta`). |
| **Si NO se alcanza la meta** | El caso puede **cancelarse/expirar** → los donantes **retiran su aporte** (`refund(caseId)`). Los fondos solo se liberan a producción en estado **FINANCIADO**. |
| **Quién paga el gas** | Cada quien paga su propia transacción (donante su donación, vet su validación). Sin Account Abstraction en el piloto. |
| **Estándar del NFT de Impacto** | **ERC-721** (coleccionable, un tokenId por certificado). Metadatos en IPFS. |
| **¿NFT transferible?** | Certificado personal → se recomienda **no transferible (soulbound)** para el piloto; decisión menor, no bloquea. |
| **Estándar de $PAWS (2ª etapa)** | **ERC-20**, suministro fijo 100,000,000. No se despliega en esta etapa. |
| **Custodia de fondos** | El **contrato del caso** custodia; libera a wallet de producción VitalPaws al financiarse. Multi-firma → 2ª etapa. |
| **Privacidad** | Datos personales/clínicos **nunca on-chain**; solo su **hash IPFS**. |

---

## 8. Programa piloto (referencia)

Piloto local de 3 meses en Trujillo, con refugio aliado y ~3 casos clínicos:
1. **Prototipado:** escaneo 3D, diseño CAD, ensamble con veterinario especialista (calibrar impresoras/flujos).
2. **Trazabilidad en Testnet:** simular financiamiento de los 3 casos; emitir "Tokens de Impacto" (NFT) como registros de datos; validar inmutabilidad.
3. **Prueba B2B:** servicio de impresión a clínica privada a costo preferencial (modelo híbrido: ventas subsidian donaciones).
4. **Métricas:** documentar tiempos, costos reales de material y resultados médicos.

Foco QA/auditoría en Testnet: **reentrancy, concurrencia, soft locks** en lógica de fondos.

---

## 9. Propuesta de Sistema (Backend + Frontend)

### 9.0. Principio de arquitectura
**El dinero nunca pasa por el backend.** Donaciones y validación van **wallet → smart contract** de forma directa. El backend solo gestiona **datos off-chain** (contenido de casos, IPFS) e **indexa eventos** de la cadena para lectura rápida. Esto respeta el mapa de confianza (Sección 7.1): lo *trustless* se queda en la cadena.

### 9.1. Arquitectura en 4 capas

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (DApp)  — Next.js + wagmi/viem + RainbowKit        │
│  · Lista de casos, ficha, barra de recaudación               │
│  · Botón "Donar" → firma tx directo al contrato              │
│  · Panel admin (VitalPaws) y panel vet (validar)             │
└───────────┬─────────────────────────────────┬───────────────┘
            │ lecturas (REST)                 │ escrituras (tx firmadas)
            ▼                                 ▼
┌───────────────────────────┐     ┌───────────────────────────┐
│  BACKEND (API + Indexer)  │     │  BLOCKCHAIN — Sepolia      │
│  Node.js + Express + TS   │◀────│  Cases.sol + ImpactNFT.sol │
│  · REST: casos, donantes  │ eventos (indexer escucha)        │
│  · Sube/pina a IPFS       │     └───────────────────────────┘
│  · Auth por firma (SIWE)  │                 │
│  · Cachea estado on-chain │                 ▼
└───────────┬───────────────┘     ┌───────────────────────────┐
            ▼                      │  IPFS (Pinata/web3.storage)│
┌───────────────────────────┐     │  · Fotos, expediente       │
│  DB — PostgreSQL + Prisma  │     │  · Metadatos del NFT       │
│  (índice/caché, no fondos) │     └───────────────────────────┘
└───────────────────────────┘
```

### 9.2. Stack recomendado

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| **Frontend** | **Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui** | Lo pedía el whitepaper; SSR para SEO de casos, UI rápida. |
| **Wallet / Web3** | **ethers.js v6 + MetaMask** | Mismo stack que la guía del profesor (`BrowserProvider`, `queryFilter`). Se descartó wagmi/viem para alinear con el curso. |
| **Backend** | **Node.js + Express + TypeScript** | Thin API; simple para un equipo de 6. (Alternativa: NestJS si quieren más estructura.) |
| **ORM / DB** | **Prisma + PostgreSQL** (o SQLite en dev) | Índice de casos y donaciones; migraciones claras. |
| **Indexer** | Worker con **viem `watchEvent`** (o Ponder) | Escucha eventos del contrato y actualiza la DB → listados rápidos sin golpear RPC. |
| **Auth** | **SIWE (Sign-In With Ethereum)** | Sin contraseñas; admin y vet se autentican firmando con su wallet. |
| **IPFS** | **Pinata** o **web3.storage** | Pinado desde el backend (la API key es secreta → nunca en el front). |
| **Contratos** | **Solidity + Hardhat + OpenZeppelin** | ERC-721, ReentrancyGuard, AccessControl ya auditados. |
| **RPC** | **Alchemy/Infura** (Sepolia) | Nodo gestionado para deploy y lecturas. |
| **Monorepo** | **pnpm workspaces + Turborepo** | Paquete compartido de **ABIs + tipos** entre front, back y contratos. |

### 9.3. Estructura de repositorio (dos carpetas)

Se optó por **dos carpetas independientes** (más simple para el equipo que un monorepo):

```
proyecto/
├── frontend/             # Next.js (DApp) — identidad del mockup
├── backend/              # Express (REST + indexer + IPFS + SIWE)
│   └── contracts/        # Hardhat: Cases.sol, ImpactNFT.sol, tests, deploy
├── mockup/               # Capturas del mockup (referencia visual)
└── CONTEXTO-PROYECTO.md
```

Cada carpeta tiene su propio `package.json`. Los **ABIs + direcciones** desplegadas se exportan de `backend/contracts` al frontend (`frontend/src/lib/contracts`) tras el deploy (Fase 3).

### 9.4. Reparto de responsabilidades (evita duplicar lógica)

| Acción | Frontend | Backend | On-chain |
|--------|:---:|:---:|:---:|
| Donar ETH | firma tx | — | **custodia + registro** |
| Ver recaudado / estado | lee (caché) | indexa evento | **fuente de verdad** |
| Crear/publicar caso | UI admin | valida + **pina expediente a IPFS** → llama `createCase` | guarda hash + meta |
| Validar prótesis | firma tx vet | pina evidencia a IPFS | **mint NFT + CERRADO** |
| Listar casos con fotos | render | sirve contenido off-chain | — |
| Reembolso si cancela | firma tx | refleja estado | **devuelve fondos** |

### 9.5. Endpoints REST mínimos (backend)

```
GET  /cases                 # lista (desde DB indexada)
GET  /cases/:id             # ficha + contenido IPFS
POST /cases                 # admin: crea (pina IPFS, llama createCase)  [SIWE admin]
POST /cases/:id/evidence    # vet: sube evidencia a IPFS antes de validar [SIWE vet]
GET  /cases/:id/donations   # donantes del caso (indexados)
POST /auth/siwe             # login por firma de wallet
```
> Las **escrituras de dinero** (donar, validar, refund) NO tienen endpoint: se hacen desde el frontend firmando la tx directo al contrato.

### 9.6. Modelo de datos (DB — solo índice/caché, nunca custodia fondos)

- **Case**: `id, onchainId, estado, metaWei, recaudadoWei, vetWallet, ipfsExpediente, ipfsEvidencia, titulo, descripcion, fotos[]`
- **Donation**: `id, caseId, donante, montoWei, txHash, timestamp` *(indexado de eventos)*
- **User**: `wallet, rol (ADMIN | VET | DONANTE)`

---

## 10. Análisis del Mockup existente

Mockup analizado con Playwright: <https://mint-hex-55389447.figma.site/> · Capturas en [`mockup/`](mockup/) (home, dashboard, tokenomics, dao, impact, wallet).

### 10.1. Qué es el mockup
Sitio **estático de marketing**, sin lógica real (todos los valores en $0 / 0%). Refleja el **alcance ORIGINAL** (pre-feedback): está centrado en **ICO / Tokenomics / DAO**, justo lo que el docente pidió recortar. 6 páginas: Home, Dashboard, Tokenomics, DAO, Impact, Connect Wallet.

### 10.2. Identidad visual a conservar
- **Paleta:** azul marino profundo `#1e2a3a` (secciones oscuras), dorado/tan `#c9a876` (acento/CTA), gris muy claro `#f5f6f8` (fondo), texto navy. Estética limpia, cards redondeadas, mucho espacio en blanco.
- **Logo:** pata biónica + pata natural formando un corazón; wordmark "VITAL PAWS — Cada paso, una nueva oportunidad".
- **Nav superior:** Home · Dashboard · Tokenomics · DAO · Impact · **Connect Wallet** (botón dorado).
- **Iconografía:** emojis 🔬🌍🗳️ en cards; badges de estado (Verificado, En progreso, Planeado).

### 10.3. Mapeo mockup → alcance recortado

| Página mockup | Contenido actual | Decisión para la implementación |
|---------------|------------------|--------------------------------|
| **Home** | Hero, "¿Por qué Web3?", bloque ICO | ✅ **Conservar** hero e identidad. ❌ Quitar bloque de compra ICO / precios de fases. |
| **Impact** | 6 tarjetas de perros (estáticas) | ✅ **Reconvertir en el núcleo:** lista de **casos reales financiables** (con meta, recaudado, botón Donar). Es la página más cercana a lo que necesitamos. |
| **Dashboard** | Progreso ICO, portafolio $PAWS, actividad | 🔧 **Reconvertir** a *seguimiento de casos*: estado de cada caso (los 9 pasos), mis donaciones, mis NFTs de impacto. Quitar progreso ICO. |
| **Wallet** | Conectar MetaMask/WalletConnect/Coinbase | ✅ **Conservar** (nuestra vía de escritura de tx). Simplificar a MetaMask para el piloto. |
| **Tokenomics** | Distribución, fases ICO, uso de fondos | ⏸️ **2ª etapa.** Dejar como página informativa estática (no operativa). |
| **DAO** | Propuestas y votación | ⏸️ **2ª etapa.** Fuera del piloto (no hay $PAWS ni votación esta etapa). |

### 10.4. Lo que el mockup NO tiene y hay que añadir (crítico)
El mockup **no cubre el flujo real recortado** (Sección 5). Falta construir:
- **Ficha de caso** (`/cases/:id`): fotos, diagnóstico, meta, recaudado, **botón "Donar X ETH"** → firma tx directa al contrato. *(El ejemplo canónico de Pedro no existe en el mockup.)*
- **Rastreador de los 9 pasos** del caso (máquina de estados de la Sección 5.2) visible al donante.
- **Panel admin (VitalPaws):** crear/publicar caso, subir expediente a IPFS.
- **Panel veterinario:** subir evidencia y **firmar validación** (Paso 8).
- **Vista del NFT de Impacto** (certificado ERC-721) en el dashboard del donante.

> **Conclusión:** el mockup sirve como **guía visual/identidad**, no como especificación funcional. La app real se centra en **casos financiables + ciclo de 9 pasos**, no en ICO/DAO. Reusamos paleta, logo y layout; reescribimos el propósito de Impact y Dashboard; posponemos Tokenomics y DAO.

---

## 11. Arranque paso a paso (roadmap de implementación)

**Estrategia:** primero una **app web 100% funcional** (frontend + backend con base de datos real), con el ciclo de casos, donaciones y certificados operando. La **capa blockchain** (contratos, wallet, NFT on-chain, IPFS) se integra **después**, reemplazando la parte simulada por transacciones reales. Reutiliza la identidad del mockup.

### Etapa A — App funcional (sin blockchain aún)

| Fase | Entregable | Detalle |
|------|-----------|---------|
| ✅ 0 | Contexto, diseño y mockup | Secciones 1–10. Capturas en `mockup/`. |
| ✅ 1 | **Scaffold dos carpetas** | `frontend/` (Next.js) + `backend/` (Express) independientes. |
| ✅ 2 | **Backend funcional** | Prisma + SQLite. CRUD de casos, donaciones (simuladas), certificados, roles. REST completo + máquina de estados de los 9 pasos. Verificado. |
| ✅ 3 | **Frontend funcional** | Lista de casos, ficha `/cases/:id` con **donar**, dashboard donante, panel admin (crear caso), panel vet (validar). Cableado al backend. |
| ✅ 4 | **App end-to-end** | Caso completo crear → donar → financiar → fabricar → instalar → validar → certificado. Verificado en navegador (Playwright). |

### Etapa B — Integración blockchain (estilo guía del profesor)

Stack alineado a la guía del curso: **Remix IDE + OpenZeppelin v5 + ethers.js v6 + MetaMask + Sepolia** (no wagmi/viem, no Hardhat-deploy). Alcance **híbrido**: on-chain = donación ETH + mint NFT; backend = contenido del caso y estados. Identidad **MetaMask híbrido** (wallet real para donar/validar; selector de roles para demo).

| Fase | Entregable | Detalle |
|------|-----------|---------|
| ✅ 5 | **Contratos Solidity** | `ImpactNFT.sol` (ERC-721 OZ v5) + `VitalPawsCases.sol` (donar payable, validar→mint, ciclo, refund/retiro). Compilan OK. Deploy en Remix → pendiente (usuario, con MetaMask+faucet). |
| ✅ 6 | **Wallet + donación on-chain** | ethers v6 + MetaMask (`frontend/src/lib/eth.ts`). Donar/validar como tx reales, con fallback a simulación si no hay contrato. Enlaces a Etherscan. |
| 🟡 7 | **NFT + registro real** | Mint real al validar (contrato→ImpactNFT). Backend guarda `txHash`/`wallet`/`closeTxHash` reales. **Pendiente:** IPFS para metadatos/evidencia e indexer de eventos (`queryFilter`). |
| ⏸️ 8 | **SIWE** | Login por firma de wallet (reemplazo total del selector). Escalable, no urgente. |
| ⏸️ 2ª etapa | ICO / Tokenomics / DAO / $PAWS | Documentado, no implementado en el piloto. |

> El `txHash`/`tokenId` se **simulan** cuando no hay contrato desplegado, y pasan a **reales** automáticamente cuando el caso tiene `onchainId` y los contratos están en `.env` — misma UI. Deploy: ver `backend/contracts/README.md`.
