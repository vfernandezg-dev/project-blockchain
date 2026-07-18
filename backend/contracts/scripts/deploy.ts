/**
 * Script de despliegue (ESQUELETO — Fase 3).
 * Desplegara ImpactNFT y Cases en Sepolia y exportara direcciones + ABIs al frontend.
 */
async function main() {
  console.log("Deploy pendiente — se implementa en la Fase 3 del roadmap.");
  // TODO Fase 3:
  // 1. deploy ImpactNFT
  // 2. deploy Cases(impactNftAddress)
  // 3. dar permiso de minteo de ImpactNFT a Cases
  // 4. escribir direcciones + ABIs en frontend/src/lib/contracts
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
