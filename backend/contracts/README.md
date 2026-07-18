# VitalPaws — Contratos (Ethereum, estilo guía del profesor)

Capa de liquidación on-chain. Custodia de donaciones en ETH + emisión del NFT de Impacto.
**Se compilan y despliegan desde Remix IDE** (igual que la guía del curso), no con Hardhat.

## Contratos
- **`contracts/ImpactNFT.sol`** — ERC-721 (OpenZeppelin v5). Se acuña al donante al cerrar el caso. Minteo restringido al contrato de casos (`setMinter`).
- **`contracts/VitalPawsCases.sol`** — custodia el ETH y el ciclo de 9 pasos: `crearCaso`, `publicarCaso`, `donar()` payable (auto-`FINANCIADO`), `fabricar`, `instalar`, `validar()` (mintea NFTs y cierra), `cancelarCaso`, `reembolsar`, `retirar`.

Solidity `^0.8.20`, OpenZeppelin v5. Verificado que compilan (ImpactNFT ~6KB, VitalPawsCases ~6.3KB).

## Despliegue en Remix (Sepolia + MetaMask)

1. Abrir <https://remix.ethereum.org>. Crear dos archivos y pegar el contenido de `ImpactNFT.sol` y `VitalPawsCases.sol`. Remix descarga los imports de OpenZeppelin automáticamente.
2. **Solidity Compiler** → versión `0.8.20+`, Enable optimization (200) → *Compile*.
3. **Deploy & Run** → Environment: **Injected Provider - MetaMask** (con MetaMask en red **Sepolia** y ETH de faucet).
4. Desplegar **`ImpactNFT`** (sin parámetros). Copiar su dirección.
5. Desplegar **`VitalPawsCases`** pasando `nftAddress` = dirección del `ImpactNFT`.
6. En `ImpactNFT`, llamar **`setMinter(<dirección de VitalPawsCases>)`** (autoriza al contrato de casos a mintear).
7. Pegar las dos direcciones en los `.env`:
   - `frontend/.env.local`: `NEXT_PUBLIC_CASES_ADDRESS`, `NEXT_PUBLIC_IMPACT_NFT_ADDRESS`
   - `backend/.env`: `CASES_ADDRESS`, `IMPACT_NFT_ADDRESS`

## Roles (identidad = wallet)
- **Owner** del contrato (quien despliega) = **ADMIN** (crea/publica/fabrica/instala/retira).
- **`vet`** de cada caso (dirección pasada en `crearCaso`) = **VET** (única que puede `validar`).
- Cualquier otra wallet = **DONANTE**.

## Faucets Sepolia
- <https://sepoliafaucet.com> · <https://www.alchemy.com/faucets/ethereum-sepolia>

> Los ABIs human-readable que consume el frontend están en `frontend/src/lib/contracts.ts`.
