import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navigationItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/upload-data", label: "Upload Data" },
  { to: "/citation-ledger", label: "Citation Ledger" },
  { to: "/ai-audit", label: "AI Audit" },
];

function shortenWalletAddress(address: string): string {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function AppLayout() {
  const { account, connected, wallet, wallets } = useWallet();
  const walletAddress = account?.address?.toString() ?? null;
  const isLoadingWallet = wallets.length === 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="w-64 border-r border-slate-300 bg-white px-6 py-8">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ThesisMesh</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Research Dashboard</h1>
          </div>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 bg-white p-8">
          <header className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shelbynet / Aptos</p>
              <p className="text-sm text-slate-700">Connect Petra wallet to sign and log on-chain research actions.</p>
              {isLoadingWallet && <p className="mt-1 text-xs text-slate-500">Detecting wallet extension...</p>}
              {!isLoadingWallet && !wallet && <p className="mt-1 text-xs text-red-600">No Aptos wallet extension detected.</p>}
            </div>

            <div className="flex items-center gap-2">
              {connected && walletAddress && (
                <div className="rounded-full border border-indigo-300 bg-indigo-100 px-3 py-1 font-mono text-sm text-indigo-800">
                  {shortenWalletAddress(walletAddress)}
                </div>
              )}
              <WalletSelector />
            </div>
          </header>

          <div className="relative">
            <Outlet />
            {!connected && (
              <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur-sm">
                <div className="max-w-md rounded-lg border border-indigo-200 bg-white p-6 text-center shadow">
                  <h2 className="text-lg font-semibold text-slate-900">Wallet Connection Required</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Connect your Petra wallet to access Dashboard views, upload datasets, and interact with the global registry.
                  </p>
                  <div className="mt-4 flex justify-center">
                    <WalletSelector />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
