// Direcciones (desde .env.local tras desplegar en Remix) y ABIs human-readable
// (mismo estilo que la guia del profe: array de strings, no JSON).

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 11155111); // Sepolia
export const CASES_ADDRESS = process.env.NEXT_PUBLIC_CASES_ADDRESS ?? "";
export const IMPACT_NFT_ADDRESS = process.env.NEXT_PUBLIC_IMPACT_NFT_ADDRESS ?? "";

export const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com";
export const ETHERSCAN_TX = "https://sepolia.etherscan.io/tx/";
export const ETHERSCAN_TOKEN = "https://sepolia.etherscan.io/token/";

/** true si ya hay contratos desplegados configurados */
export const onchainEnabled = () =>
  CASES_ADDRESS.startsWith("0x") && CASES_ADDRESS.length === 42;

export const CASES_ABI = [
  "function proximoId() view returns (uint256)",
  "function casos(uint256) view returns (uint256 meta, uint256 recaudado, uint8 estado, address vet, bool existe, bool fondosRetirados)",
  "function donantesDe(uint256) view returns (address[])",
  "function numDonantes(uint256) view returns (uint256)",
  "function crearCaso(uint256 metaWei, address vet) returns (uint256)",
  "function publicarCaso(uint256 id)",
  "function donar(uint256 id) payable",
  "function fabricar(uint256 id)",
  "function instalar(uint256 id)",
  "function validar(uint256 id, string uri)",
  "function cancelarCaso(uint256 id)",
  "function reembolsar(uint256 id)",
  "function retirar(uint256 id)",
  "event CasoCreado(uint256 indexed id, uint256 meta, address vet)",
  "event DonacionRecibida(uint256 indexed id, address indexed donante, uint256 monto)",
  "event CasoFinanciado(uint256 indexed id, uint256 recaudado)",
  "event CasoValidado(uint256 indexed id, string uri, uint256 nftsMinteados)",
];

export const NFT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function totalAcunados() view returns (uint256)",
];
