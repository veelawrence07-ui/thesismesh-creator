import { WalletSelector as AptosWalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

export function WalletSelector() {
  return <AptosWalletSelector />;
}
