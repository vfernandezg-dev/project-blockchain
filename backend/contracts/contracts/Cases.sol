// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title Cases (ESQUELETO — Fase 1 scaffold)
 * @notice Custodia y ciclo de vida de un caso de protesis canina.
 *         La logica completa se implementa en la Fase 2. Ver CONTEXTO-PROYECTO.md (Seccion 5).
 *
 * Maquina de estados:
 *   CREADO -> PUBLICADO -> FINANCIADO -> EN_FABRICACION -> INSTALADA -> CERRADO
 *                 |            |
 *                 +----> CANCELADO  (expira/no llega a meta -> donantes hacen refund)
 */
contract Cases {
    enum Estado {
        CREADO,
        PUBLICADO,
        FINANCIADO,
        EN_FABRICACION,
        INSTALADA,
        CERRADO,
        CANCELADO
    }

    // TODO Fase 2:
    // - struct Case { meta, recaudado, estado, vet, ipfsExpediente, ipfsEvidencia }
    // - createCase / publishCase (solo VitalPaws)
    // - donate(caseId) payable  -> auto FINANCIADO al alcanzar meta
    // - setEnFabricacion / setInstalada (solo VitalPaws)
    // - validar(caseId, ipfsEvidencia) (solo vet del caso) -> mint NFT + CERRADO
    // - cancelCase / refund
    // - Proteccion reentrancy en donate y liberacion de fondos
}
