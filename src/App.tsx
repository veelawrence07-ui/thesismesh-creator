import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import AIAudit from "@/pages/AIAudit";
import CitationLedger from "@/pages/CitationLedger";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import UploadData from "@/pages/UploadData";

const queryClient = new QueryClient();

type AptosAccountResponse = {
  address?: string;
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const restoreWalletSession = async () => {
      const wallet = (window as Window & {
        aptos?: {
          account?: () => Promise<AptosAccountResponse>;
        };
      }).aptos;

      if (!wallet?.account) {
        return;
      }

      try {
        const account = await wallet.account();
        setWalletAddress(account.address ?? null);
      } catch {
        setWalletAddress(null);
      }
    };

    void restoreWalletSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout walletAddress={walletAddress} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload-data" element={<UploadData />} />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/citation-ledger" element={<CitationLedger />} />
              <Route path="/ai-audit" element={<AIAudit />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
