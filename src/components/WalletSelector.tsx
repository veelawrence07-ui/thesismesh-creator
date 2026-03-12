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

  // THE FIX: Convert the address object to a string before slicing it
  if (connected && account) {
    const addressString = account.address.toString();
    
    return (
      <Button variant="outline" onClick={disconnect}>
        {addressString.slice(0, 6)}...{addressString.slice(-4)}
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
