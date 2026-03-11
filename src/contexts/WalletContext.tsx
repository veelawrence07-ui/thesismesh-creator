import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface AptosWalletAccount {
  address: string;
}

interface AptosWallet {
  connect: () => Promise<AptosWalletAccount>;
  account?: () => Promise<AptosWalletAccount>;
  isConnected?: () => Promise<boolean>;
  disconnect?: () => Promise<void>;
}

type AptosWindow = Window & {
  aptos?: AptosWallet;
};

interface WalletContextValue {
  walletAddress: string | null;
  isConnected: boolean;
  isWalletAvailable: boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const wallet = (window as AptosWindow).aptos;

    setIsWalletAvailable(Boolean(wallet));

    if (!wallet?.account) {
      return;
    }

    const initializeWallet = async () => {
      try {
        // If the wallet has already been authorized, Petra returns the active account here.
        const account = await wallet.account();

        if (account?.address) {
          setWalletAddress(account.address);
          setIsConnected(true);
          return;
        }

        setWalletAddress(null);
        setIsConnected(false);
      } catch {
        setWalletAddress(null);
        setIsConnected(false);
      }
    };

    void initializeWallet();
  }, []);

  const connectWallet = async () => {
    const wallet = (window as AptosWindow).aptos;

    if (!wallet) {
      throw new Error("Petra wallet is not installed.");
    }

    setIsConnecting(true);

    try {
      const account = await wallet.connect();
      setWalletAddress(account.address);
      setIsConnected(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    const wallet = (window as AptosWindow).aptos;

    if (!wallet?.disconnect) {
      setWalletAddress(null);
      setIsConnected(false);
      return;
    }

    await wallet.disconnect();
    setWalletAddress(null);
    setIsConnected(false);
  };

  const value = useMemo(
    () => ({
      walletAddress,
      isConnected,
      isWalletAvailable,
      isConnecting,
      connectWallet,
      disconnectWallet,
    }),
    [walletAddress, isConnected, isWalletAvailable, isConnecting],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
}

export function shortenWalletAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
