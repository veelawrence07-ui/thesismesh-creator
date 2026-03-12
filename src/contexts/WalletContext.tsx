import { useWallet as useAdapterWallet } from "@aptos-labs/wallet-adapter-react";

export function useWallet() {
  return useAdapterWallet();
}

export function shortenWalletAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
