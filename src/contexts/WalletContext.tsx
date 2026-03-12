import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import type { ReactNode } from "react";

const LEGACY_NETWORK_NAME = "shelbynet";

function clearLegacyShelbynetWalletState() {
  if (typeof window === "undefined") return;

  try {
    const keysToRemove: string[] = [];

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;

      const value = window.localStorage.getItem(key);
      if (!value) continue;

      const isWalletRelated = /aptos|wallet|petra/i.test(key);
      const hasLegacyNetwork = value.toLowerCase().includes(LEGACY_NETWORK_NAME);
      if (isWalletRelated && hasLegacyNetwork) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage access errors and continue with the current session.
  }
}

clearLegacyShelbynetWalletState();

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider
      autoConnect
      optInWallets={["Petra"]}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

export const useWallet = useAptosWallet;

export function shortenWalletAddress(address: any): string {
  if (!address) return "";
  
  // Safely convert the object to a string
  const addressString = address.toString();

  if (addressString.length <= 12) {
    return addressString;
  }

  return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
}
