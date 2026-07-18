// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IImpactNFT {
    function mint(address to, string memory uri) external returns (uint256);
}

/**
 * @title VitalPawsCases — custodia de donaciones y ciclo de vida de un caso
 * @notice Reune los patrones de la guia del profesor:
 *   - donar() payable  (como comprarTokens() de 19/26_BallenitaFC)
 *   - transfer de ETH   (como 18_Payable / retirar())
 *   - eventos indexados (como CompraTokens de 26_BallenitaExam)
 *   - modifier owner    (Ownable de OZ v5)
 *   - llamada contrato->contrato para mintear el NFT (como 22/23_Ballenita)
 *
 * Alcance HIBRIDO: aqui vive el dinero (ETH) y el cierre (mint NFT). El contenido
 * del caso (fotos, diagnostico) vive en el backend off-chain.
 */
contract VitalPawsCases is Ownable, ReentrancyGuard {
    // Coincide 1:1 con el CaseStatus de Prisma
    enum Estado {
        CREADO,
        PUBLICADO,
        FINANCIADO,
        EN_FABRICACION,
        INSTALADA,
        CERRADO,
        CANCELADO
    }

    struct Caso {
        uint256 meta; // objetivo en wei
        uint256 recaudado; // wei aportados
        Estado estado;
        address vet; // veterinario que puede validar
        bool existe;
        bool fondosRetirados;
    }

    IImpactNFT public immutable nft;
    uint256 public proximoId; // autoincremental de casos

    mapping(uint256 => Caso) public casos;
    mapping(uint256 => address[]) private _donantes; // donantes unicos por caso
    mapping(uint256 => mapping(address => uint256)) public aporteDe; // caso => donante => wei

    event CasoCreado(uint256 indexed id, uint256 meta, address vet);
    event CasoPublicado(uint256 indexed id);
    event DonacionRecibida(uint256 indexed id, address indexed donante, uint256 monto);
    event CasoFinanciado(uint256 indexed id, uint256 recaudado);
    event EstadoCambiado(uint256 indexed id, Estado estado);
    event CasoValidado(uint256 indexed id, string uri, uint256 nftsMinteados);
    event CasoCancelado(uint256 indexed id);
    event Reembolso(uint256 indexed id, address indexed donante, uint256 monto);
    event FondosRetirados(uint256 indexed id, uint256 monto);

    constructor(address nftAddress) Ownable(msg.sender) {
        require(nftAddress != address(0), "NFT invalido");
        nft = IImpactNFT(nftAddress);
    }

    modifier existeCaso(uint256 id) {
        require(casos[id].existe, "Caso inexistente");
        _;
    }

    /* -------- Paso 1-3: crear y publicar (owner = VitalPaws) -------- */

    function crearCaso(uint256 metaWei, address vet) external onlyOwner returns (uint256) {
        require(metaWei > 0, "Meta > 0");
        require(vet != address(0), "Vet invalido");
        uint256 id = ++proximoId;
        casos[id] = Caso({
            meta: metaWei,
            recaudado: 0,
            estado: Estado.CREADO,
            vet: vet,
            existe: true,
            fondosRetirados: false
        });
        emit CasoCreado(id, metaWei, vet);
        return id;
    }

    function publicarCaso(uint256 id) external onlyOwner existeCaso(id) {
        require(casos[id].estado == Estado.CREADO, "No esta CREADO");
        casos[id].estado = Estado.PUBLICADO;
        emit CasoPublicado(id);
    }

    /* -------- Paso 4-5: donar (auto-financia) -------- */

    function donar(uint256 id) external payable existeCaso(id) {
        Caso storage c = casos[id];
        require(c.estado == Estado.PUBLICADO, "No admite donaciones");
        require(msg.value > 0, "Monto > 0");

        if (aporteDe[id][msg.sender] == 0) {
            _donantes[id].push(msg.sender);
        }
        aporteDe[id][msg.sender] += msg.value;
        c.recaudado += msg.value;
        emit DonacionRecibida(id, msg.sender, msg.value);

        if (c.recaudado >= c.meta) {
            c.estado = Estado.FINANCIADO;
            emit CasoFinanciado(id, c.recaudado);
        }
    }

    /* -------- Paso 6-7: fabricar / instalar (owner) -------- */

    function fabricar(uint256 id) external onlyOwner existeCaso(id) {
        require(casos[id].estado == Estado.FINANCIADO, "No esta FINANCIADO");
        casos[id].estado = Estado.EN_FABRICACION;
        emit EstadoCambiado(id, Estado.EN_FABRICACION);
    }

    function instalar(uint256 id) external onlyOwner existeCaso(id) {
        require(casos[id].estado == Estado.EN_FABRICACION, "No esta EN_FABRICACION");
        casos[id].estado = Estado.INSTALADA;
        emit EstadoCambiado(id, Estado.INSTALADA);
    }

    /* -------- Paso 8-9: validar (vet) -> mintea NFT y cierra -------- */

    function validar(uint256 id, string memory uri) external existeCaso(id) {
        Caso storage c = casos[id];
        require(msg.sender == c.vet, "Solo el vet del caso");
        require(c.estado == Estado.INSTALADA, "No esta INSTALADA");

        address[] memory ds = _donantes[id];
        for (uint256 i = 0; i < ds.length; i++) {
            nft.mint(ds[i], uri); // un certificado por donante unico
        }
        c.estado = Estado.CERRADO;
        emit CasoValidado(id, uri, ds.length);
    }

    /* -------- Cancelar / reembolso / retiro -------- */

    function cancelarCaso(uint256 id) external onlyOwner existeCaso(id) {
        Estado e = casos[id].estado;
        require(e == Estado.PUBLICADO || e == Estado.FINANCIADO, "No cancelable");
        casos[id].estado = Estado.CANCELADO;
        emit CasoCancelado(id);
    }

    /// @notice El donante recupera su aporte si el caso fue CANCELADO (patron retirar/transfer).
    function reembolsar(uint256 id) external nonReentrant existeCaso(id) {
        require(casos[id].estado == Estado.CANCELADO, "No esta CANCELADO");
        uint256 monto = aporteDe[id][msg.sender];
        require(monto > 0, "Nada que reembolsar");
        aporteDe[id][msg.sender] = 0; // efecto antes de la interaccion (CEI)
        casos[id].recaudado -= monto;
        (bool ok, ) = payable(msg.sender).call{value: monto}("");
        require(ok, "Fallo el reembolso");
        emit Reembolso(id, msg.sender, monto);
    }

    /// @notice El owner retira los fondos de un caso financiado para producir la protesis.
    function retirar(uint256 id) external onlyOwner nonReentrant existeCaso(id) {
        Caso storage c = casos[id];
        require(c.estado != Estado.CANCELADO, "Caso cancelado");
        require(c.recaudado >= c.meta, "No financiado");
        require(!c.fondosRetirados, "Ya retirado");
        uint256 monto = c.recaudado;
        c.fondosRetirados = true;
        (bool ok, ) = payable(owner()).call{value: monto}("");
        require(ok, "Fallo el retiro");
        emit FondosRetirados(id, monto);
    }

    /* -------- Lecturas -------- */

    function donantesDe(uint256 id) external view returns (address[] memory) {
        return _donantes[id];
    }

    function numDonantes(uint256 id) external view returns (uint256) {
        return _donantes[id].length;
    }
}
