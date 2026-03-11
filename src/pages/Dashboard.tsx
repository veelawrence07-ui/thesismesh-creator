import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics, useRecentActivity } from "@/hooks/useThesisMeshData";

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
              <p className="text-sm text-slate-600">Loading activity feed...</p>
            ) : (
              <ul className="space-y-3">
                {(activity ?? []).map((item) => (
                  <li key={item.id} className="rounded-md border border-slate-200 p-3">
                    <p className="font-medium text-slate-900">{item.datasetTitle}</p>
                    <p className="text-sm text-slate-600">
                      {item.researcher} · {new Date(item.dateUploaded).toLocaleString()}
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
