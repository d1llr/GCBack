import { bsc } from "@wagmi/core/chains"

// \\//\\//\\//\\// interfaces & types \\//\\//\\//\\//

export type ChainId = (typeof registerdChainIds)[number]

export interface network {
  rpc: string
  chainId: number
  scanner: string
  name: string
  symbol: string
  short: string
  type: "mainnet" | "testnet"
}

type MapType = {
  [token: string]: network
}

// \\//\\//\\//\\// constants & variables \\//\\//\\//\\//

const networks: MapType = {
  bsc_testnet: {
    rpc: "https://data-seed-prebsc-1-s1.binance.org:8545",
    chainId: 97,
    scanner: "https://testnet.bscscan.com/",
    name: "Binance Smart Chain Testnet",
    symbol: "BNB",
    short: "bsc_testnet",
    type: "testnet",
  },
  bsc_mainnet: {
    rpc: "https://bsc-dataseed1.binance.org/",
    chainId: 56,
    scanner: "https://bscscan.com/",
    name: "Binance Smart Chain",
    symbol: "BNB",
    short: "bsc_mainnet",
    type: "mainnet",
  },
  octa: {
    rpc: "https://rpc.octa.space",
    chainId: 800001,
    scanner: "https://explorer.octa.space/",
    name: "Octa Space",
    symbol: "OCTA",
    short: "octa",
    type: "mainnet",
  },
}

export const NETWORKS: MapType = {
  "800001": networks.octa,
  "97": networks.bsc_testnet,
  "56": networks.bsc_mainnet,
}

export const registerdChainIds: number[] = [bsc.id]

export const DEFAULT_CHAINID = registerdChainIds[0]

// \\//\\//\\//\\// functions \\//\\//\\//\\//

export function hexId(chainId: number): string {
  return `0x${chainId.toString(16)}`
}

export function supportedChain(chainId: number): boolean {
  return registerdChainIds.find((element) => element === chainId) !== undefined
}
