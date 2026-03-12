import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchCitationLedger,
  fetchDashboardMetrics,
  fetchRecentActivity,
  verifyCitationHash,
} from "@/services/api";

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: fetchDashboardMetrics,
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ["recent-activity"],
    queryFn: fetchRecentActivity,
  });
}

export function useCitationLedger() {
  return useQuery({
    queryKey: ["citation-ledger"],
    queryFn: fetchCitationLedger,
  });
}

export function useAuditVerification() {
  return useMutation({
    mutationFn: (hash: string) => verifyCitationHash(hash),
  });
}
