import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardMetrics, useRecentActivity } from "@/hooks/useThesisMeshData";

function truncateHash(hash: string): string {
  if (hash.length <= 14) {
    return hash;
  }

  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: activity, isLoading: loadingActivity } = useRecentActivity();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-600">Overview of network-secured research assets.</p>
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
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <ul className="space-y-3">
                {(activity ?? []).map((item) => (
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
