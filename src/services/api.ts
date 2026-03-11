import { ShelbyClient } from '@shelby-protocol/sdk';

// Global declaration for the Petra Wallet extension
declare global {
  interface Window {
    aptos?: any;
  }
}

// Initialize the client for the Shelbynet testnet
const shelby = new ShelbyClient({ network: 'testnet' });

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
  if (!payload.file) {
    throw new Error("A file is required for upload.");
  }

  const wallet = window.aptos;
  if (!wallet) {
    throw new Error("Petra wallet extension is not installed.");
  }
  
  const { address } = await wallet.connect();

  const uploadResult = await shelby.upload({
    file: payload.file,
    metadata: {
      title: payload.datasetTitle,
      faculty: payload.facultyDiscipline,
      researcher: payload.primaryResearcher
    },
    owner: address,
    provenanceEnabled: true 
  });

  // Optional: You can add a fetch() call here to POST the uploadResult.transactionHash 
  // to your backend database so it appears in the CitationLedgerRecord.

  return {
    transactionHash: uploadResult.transactionHash
  };
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
