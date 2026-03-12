import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/contexts/WalletContext";
import { useDashboardMetrics, useRecentActivity } from "@/hooks/useThesisMeshData";

function truncateHash(hash: string): string {
  if (hash.length <= 14) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"global" | "mine">("global");
  const { account, connected, network } = useWallet();
  const walletAddress = account?.address?.toString() ?? null;
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: activity, isLoading: loadingActivity } = useRecentActivity();

  const visibleActivity = useMemo(() => {
    const records = activity ?? [];

    if (viewMode !== "mine" || !walletAddress) {
      return records;
    }

    const storageKey = "thesismesh-wallet-uploads";
    const saved = window.localStorage.getItem(storageKey);
    const parsed = saved ? (JSON.parse(saved) as Record<string, string[]>) : {};
    const mine = new Set(parsed[walletAddress] ?? []);

    return records.filter((record) => mine.has(record.cryptographicReceipt));
  }, [activity, viewMode, walletAddress]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600">Overview of network-secured research assets.</p>
        <p className="mt-1 text-xs text-slate-500">
          Wallet: {connected ? "Connected" : "Disconnected"} · Network: {network?.name ?? "Unknown"}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Datasets Secured"
          value={loadingMetrics || !metrics ? "Loading..." : metrics.totalDatasetsSecured.toLocaleString()}
        />
        <MetricCard
          title="Global Faculties Connected"
          value={loadingMetrics || !metrics ? "Loading..." : metrics.globalFacultiesConnected.toLocaleString()}
        />
        <MetricCard
          title="Total Egress Saved"
          value={loadingMetrics || !metrics ? "Loading..." : metrics.totalEgressSaved}
        />
      </section>

      <section>
        <Card className="border-slate-300">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "global" ? "default" : "outline"}
                className={viewMode === "global" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                onClick={() => setViewMode("global")}
              >
                Global Registry
              </Button>
              <Button
                variant={viewMode === "mine" ? "default" : "outline"}
                className={viewMode === "mine" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                onClick={() => setViewMode("mine")}
              >
                My Uploads
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : visibleActivity.length === 0 ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {viewMode === "mine"
                  ? "No uploads are linked to this connected wallet yet."
                  : "No activity has been indexed yet."}
              </div>
            ) : (
              <ul className="space-y-3">
                {visibleActivity.map((item) => (
                  <li key={item.id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium text-slate-900">{item.datasetTitle}</p>
                      <Badge
                        variant="secondary"
                        className="cursor-pointer font-mono text-xs"
                        onClick={() => navigator.clipboard.writeText(item.cryptographicReceipt)}
                        title="Click to copy full Shelby hash"
                      >
                        {truncateHash(item.cryptographicReceipt)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {item.researcher} · {item.faculty} · {item.dateUploaded}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card className="border-slate-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-indigo-700">{value}</p>
      </CardContent>
    </Card>
  );
}
