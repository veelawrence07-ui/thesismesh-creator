import { useMemo, useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WalletSelector({ className }: { className?: string }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connected, wallet, wallets, connect, disconnect } = useWallet();

  const petraWallet = useMemo(
    () => wallets.find((walletOption) => walletOption.name.toLowerCase().includes("petra")),
    [wallets],
  );

  const onConnect = async (walletName: string) => {
    setIsConnecting(true);

    try {
      await connect(walletName as never);
    } finally {
      setIsConnecting(false);
    }
  };

  if (connected && wallet) {
    return (
      <Button type="button" variant="outline" className={className} onClick={() => void disconnect()}>
        Disconnect {wallet.name}
      </Button>
    );
  }

  if (wallets.length === 0) {
    return (
      <Button type="button" className={className} disabled>
        Detecting Wallets...
      </Button>
    );
  }

  if (petraWallet) {
    return (
      <Button type="button" className={className} disabled={isConnecting} onClick={() => void onConnect(petraWallet.name)}>
        {isConnecting ? "Connecting..." : "Connect Petra Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className={className} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {wallets.map((walletOption) => (
          <DropdownMenuItem
            key={walletOption.name}
            onSelect={() => {
              void onConnect(walletOption.name);
            }}
          >
            {walletOption.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
