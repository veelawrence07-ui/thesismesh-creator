import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button"; 

export function WalletSelector() {
  const { account, connected, connect, disconnect, wallets } = useWallet();

  const handleConnect = () => {
    // Look directly into the adapter's brain for Petra
    const petraWallet = wallets?.find((w) => w.name === "Petra");
    
    if (petraWallet) {
      connect(petraWallet.name);
    } else {
      alert("Petra wallet not detected! Please unlock the extension or refresh the page.");
    }
  };

  // If connected, show their address and allow them to click to disconnect
  if (connected && account) {
    return (
      <Button variant="outline" onClick={disconnect}>
        {account.address.slice(0, 6)}...{account.address.slice(-4)}
      </Button>
    );
  }

  // If not connected, show your native shadcn connect button
  return (
    <Button onClick={handleConnect}>
      Connect Wallet
    </Button>
  );
}
