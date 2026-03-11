import { ShelbyClient } from "@shelby-protocol/sdk/browser";

export interface UploadDatasetPayload {
  datasetTitle: string;
  facultyDiscipline: string;
  primaryResearcher: string;
  file: File | null;
}

export interface UploadDatasetResponse {
  transactionHash: string;
}

export interface CitationLedgerRecord {
  id: string;
  datasetTitle: string;
  dateUploaded: string;
  faculty: string;
  cryptographicReceipt: string;
}

export interface DashboardMetrics {
  totalDatasetsSecured: number;
  globalFacultiesConnected: number;
  totalEgressSaved: string;
}

export interface RecentActivityRecord {
  id: string;
  datasetTitle: string;
  dateUploaded: string;
  researcher: string;
}

export interface AuditMessageResponse {
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function uploadDataset(
  payload: UploadDatasetPayload,
): Promise<UploadDatasetResponse> {
  const formData = new FormData();
  formData.append("datasetTitle", payload.datasetTitle);
  formData.append("facultyDiscipline", payload.facultyDiscipline);
  formData.append("primaryResearcher", payload.primaryResearcher);

  if (payload.file) {
    formData.append("file", payload.file);
  }

  const response = await fetch(`${API_BASE_URL}/datasets/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Upload failed with status ${response.status}`);
  }

  return response.json() as Promise<UploadDatasetResponse>;
}

export function fetchCitationLedger(): Promise<CitationLedgerRecord[]> {
  return request<CitationLedgerRecord[]>("/citations/ledger");
}

export function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  return request<DashboardMetrics>("/dashboard/metrics");
}

export function fetchRecentActivity(): Promise<RecentActivityRecord[]> {
  return request<RecentActivityRecord[]>("/dashboard/activity");
}

export function verifyCitationHash(hash: string): Promise<AuditMessageResponse> {
  return request<AuditMessageResponse>("/audit/verify", {
    method: "POST",
    body: JSON.stringify({ hash }),
  });
}
