// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin v5 (mismo estilo de imports que la guia del profesor)
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ImpactNFT — Certificado de Impacto de VitalPaws (ERC-721)
 * @notice Se acuña al donante cuando su caso se valida (cierra). Patron _safeMint
 *         como en 20_MiniNFT.sol de la guia, con tokenURI por token (metadata IPFS/dataURI).
 *
 * El minteo esta restringido al contrato VitalPawsCases (autorizado por el owner).
 */
contract ImpactNFT is ERC721URIStorage, Ownable {
    uint256 private _proximoTokenId; // contador manual (OZ v5 quito Counters)
    address public minter; // contrato VitalPawsCases autorizado a mintear

    event MinterActualizado(address indexed minter);

    constructor() ERC721("VitalPaws Impact Certificate", "VPIC") Ownable(msg.sender) {}

    modifier soloMinter() {
        require(msg.sender == minter, "No autorizado a mintear");
        _;
    }

    /// @notice El owner autoriza al contrato de casos como unico minter.
    function setMinter(address nuevoMinter) external onlyOwner {
        require(nuevoMinter != address(0), "Minter invalido");
        minter = nuevoMinter;
        emit MinterActualizado(nuevoMinter);
    }

    /// @notice Acuña un certificado al donante. Solo lo llama VitalPawsCases.
    function mint(address to, string memory uri) external soloMinter returns (uint256) {
        uint256 tokenId = ++_proximoTokenId; // empieza en 1
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    /// @notice Total de certificados acuñados.
    function totalAcunados() external view returns (uint256) {
        return _proximoTokenId;
    }
}
