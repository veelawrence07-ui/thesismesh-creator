import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type WalletOption = { name: string };

type WalletAccount = { address: { toString: () => string } };

type WalletContextValue = {
  connected: boolean;
  wallet: WalletOption | null;
  wallets: WalletOption[];
  account: WalletAccount | null;
  network: { name: string };
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSubmitTransaction: (_transaction: unknown) => Promise<{ hash: string }>;
};

const WALLET_STORAGE_KEY = "thesismesh-wallet-address";
const walletOptions: WalletOption[] = [{ name: "Demo Wallet" }];

const WalletContext = createContext<WalletContextValue | null>(null);

function createAddress(): string {
  const randomPart = Math.random().toString(16).slice(2, 34).padEnd(32, "0");
  return `0x${randomPart}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(() => window.localStorage.getItem(WALLET_STORAGE_KEY));

  const value = useMemo<WalletContextValue>(() => {
    const connected = Boolean(address);

    return {
      connected,
      wallet: connected ? walletOptions[0] : null,
      wallets: walletOptions,
      account: address
        ? {
            address: {
              toString: () => address,
            },
          }
        : null,
      network: { name: "Shelbynet" },
      connect: async () => {
        const nextAddress = window.localStorage.getItem(WALLET_STORAGE_KEY) ?? createAddress();
        window.localStorage.setItem(WALLET_STORAGE_KEY, nextAddress);
        setAddress(nextAddress);
      },
      disconnect: async () => {
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
        setAddress(null);
      },
      signAndSubmitTransaction: async () => ({
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
      }),
    };
  }, [address]);

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }

  return context;
}

export function shortenWalletAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
