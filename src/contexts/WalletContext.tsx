import { AptosWalletAdapterProvider, useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import type { ReactNode } from "react";
import { useMemo } from "react";

export function WalletProvider({ children }: { children: ReactNode }) {
  const plugins = useMemo(() => [new PetraWallet()], []);

  return (
    <AptosWalletAdapterProvider
      plugins={plugins}
      dappConfig={{
        network: Network.CUSTOM,
        fullnode: "https://api.shelbynet.shelby.xyz/v1",
      }}
      autoConnect
      optInWallets={["Petra"]}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}

export const useWallet = useAptosWallet;

export function shortenWalletAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
