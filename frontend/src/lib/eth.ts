// Helpers de MetaMask + ethers v6 (patron de la guia: 3_a.txt, 7.html, 8_a.txt).
import { BrowserProvider, Contract, JsonRpcProvider, parseEther } from "ethers";
import {
  CASES_ABI,
  CASES_ADDRESS,
  CHAIN_ID,
  NFT_ABI,
  IMPACT_NFT_ADDRESS,
  SEPOLIA_RPC,
} from "./contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function hasMetaMask() {
  return typeof window !== "undefined" && window.ethereum != null;
}

/** Provider de solo lectura (RPC publico, como 1.html) */
export function readProvider() {
  return new JsonRpcProvider(SEPOLIA_RPC);
}

/** Conecta MetaMask y devuelve la direccion. Cambia a Sepolia si hace falta. */
export async function connectWallet(): Promise<string> {
  if (!hasMetaMask()) throw new Error("MetaMask no está instalado");
  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  // asegurar red Sepolia
  const net = await provider.getNetwork();
  if (Number(net.chainId) !== CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
      });
    } catch {
      throw new Error("Cambia MetaMask a la red Sepolia");
    }
  }
  const signer = await provider.getSigner();
  return signer.getAddress();
}

export function onAccountsChanged(cb: (accounts: string[]) => void) {
  if (hasMetaMask()) window.ethereum.on("accountsChanged", cb);
}

async function signerContract() {
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new Contract(CASES_ADDRESS, CASES_ABI, signer);
}

export function readCasesContract() {
  return new Contract(CASES_ADDRESS, CASES_ABI, readProvider());
}

export function readNftContract() {
  return new Contract(IMPACT_NFT_ADDRESS, NFT_ABI, readProvider());
}

/* -------- Escrituras (tx firmadas por MetaMask) -------- */

/** Dona ETH a un caso. Devuelve el hash real de la tx. */
export async function donarOnchain(onchainId: number, amountEth: string): Promise<string> {
  const c = await signerContract();
  const tx = await c.donar(onchainId, { value: parseEther(amountEth) });
  await tx.wait();
  return tx.hash;
}

/** Valida el caso (solo vet): mintea NFTs y cierra. Devuelve el hash. */
export async function validarOnchain(onchainId: number, uri: string): Promise<string> {
  const c = await signerContract();
  const tx = await c.validar(onchainId, uri);
  await tx.wait();
  return tx.hash;
}

export async function crearCasoOnchain(metaEth: string, vet: string): Promise<{ hash: string; id: number }> {
  const c = await signerContract();
  const tx = await c.crearCaso(parseEther(metaEth), vet);
  const receipt = await tx.wait();
  // id = proximoId tras crear (o leer del evento CasoCreado)
  const id = Number(await c.proximoId());
  return { hash: tx.hash, id };
}

export async function publicarOnchain(onchainId: number) {
  const c = await signerContract();
  const tx = await c.publicarCaso(onchainId);
  await tx.wait();
  return tx.hash;
}

export async function fabricarOnchain(onchainId: number) {
  const c = await signerContract();
  const tx = await c.fabricar(onchainId);
  await tx.wait();
  return tx.hash;
}

export async function instalarOnchain(onchainId: number) {
  const c = await signerContract();
  const tx = await c.instalar(onchainId);
  await tx.wait();
  return tx.hash;
}
