import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Network } from "@aptos-labs/ts-sdk";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import AIAudit from "@/pages/AIAudit";
import CitationLedger from "@/pages/CitationLedger";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import UploadData from "@/pages/UploadData";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

const queryClient = new QueryClient();
const wallets = [new PetraWallet()];

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AptosWalletAdapterProvider
        plugins={wallets}
        dappConfig={{
          network: Network.CUSTOM,
          aptosConnect: {
            network: {
              customConfig: {
                chainId: 1,
                name: "Shelbynet",
                url: "https://api.shelbynet.shelby.xyz/v1",
              },
            },
          },
        }}
        autoConnect
      >
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload-data" element={<UploadData />} />
              <Route path="/citation-ledger" element={<CitationLedger />} />
              <Route path="/ai-audit" element={<AIAudit />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AptosWalletAdapterProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
