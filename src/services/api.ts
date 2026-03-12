import { SHELBYNET_INDEXER_URL } from "@/config/aptos";

const CONTRACT_ADDRESS =
  "0xda877009fc36736b2a3da44c4b3993ab1c9b47d390146a33e1299994b9738ea9";

// Load your Geomi Client API Key from the environment variables
const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

const GET_DATASET_EVENTS_QUERY = `
query GetDatasetEvents {
  events(
    where: {
      type: { _like: "%Dataset%" }
    }
    order_by: { transaction_version: desc }
    limit: 50
  ) {
    type
    transaction_version
    data
  }
}
`;

interface GraphQLError { message: string }
interface DatasetEventData {
  title: string;
  faculty: string;
  researcher: string;
  shelby_hash: string;
  upload_time: string | number;
}
interface DatasetEvent { 
  type?: string; 
  transaction_version: number | string; 
  data: DatasetEventData | string;
}
interface GetDatasetEventsResponse { data?: { events: DatasetEvent[] }; errors?: GraphQLError[] }

export interface CitationLedgerRecord {
  id: string;
  datasetTitle: string;
  dateUploaded: string;
  faculty: string;
  researcher: string;
  cryptographicReceipt: string;
}
export interface DashboardMetrics {
  totalDatasetsSecured: number;
  globalFacultiesConnected: number;
  totalEgressSaved: string;
}
export interface RecentActivityRecord extends CitationLedgerRecord {}
export interface AuditMessageResponse { message: string }

// standard payload structure for Aptos wallet adapters
type TransactionPayload = { 
  data: { 
    function: string; 
    functionArguments: string[] 
  } 
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!response.ok) {
    throw new Error((await response.text()) || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

function formatMicrosecondsToDate(uploadTime: string | number): string {
  const timestamp = Number(uploadTime);
  return Number.isFinite(timestamp) ? new Date(Math.floor(timestamp / 1000)).toLocaleString() : "Unknown date";
}

function parseEventData(data: DatasetEvent['data']): DatasetEventData | null {
  if (typeof data === 'string') {
    try { return JSON.parse(data) as DatasetEventData; } catch { return null; }
  }
  return data as DatasetEventData;
}

async function fetchDatasetEvents(): Promise<DatasetEvent[]> {
  console.log("📡 Querying Shelbynet Indexer...");
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Inject the API key if it exists
  if (SHELBY_API_KEY) {
    headers['Authorization'] = `Bearer ${SHELBY_API_KEY}`;
  } else {
    console.warn("⚠️ VITE_SHELBY_API_KEY is missing. Indexer query may be rate-limited or fail.");
  }
  
  const response = await fetch(SHELBYNET_INDEXER_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: GET_DATASET_EVENTS_QUERY }),
  });
  
  if (!response.ok) {
    throw new Error((await response.text()) || `GraphQL request failed with status ${response.status}`);
  }
  
  const body = (await response.json()) as GetDatasetEventsResponse;
  
  console.log("📦 Raw Indexer Data:", body);
  
  if (body.errors?.length) {
    console.error("❌ GraphQL Errors:", body.errors);
    throw new Error(body.errors.map((error) => error.message).join(', '));
  }
  
  return body.data?.events ?? [];
}

export async function fetchCitationLedger(): Promise<CitationLedgerRecord[]> {
  const events = await fetchDatasetEvents();
  return events
    .map((event) => {
      const data = parseEventData(event.data);
      if (!data) return null;
      
      console.log("🔍 Parsed Event Data:", data);
      
      return {
        id: String(event.transaction_version),
        datasetTitle: data.title || "Unknown Title",
        dateUploaded: data.upload_time ? formatMicrosecondsToDate(data.upload_time) : "Unknown Date",
        faculty: data.faculty || "Unknown Faculty",
        researcher: data.researcher || "Unknown Researcher",
        cryptographicReceipt: data.shelby_hash || "No Hash",
      };
    })
    .filter((record): record is CitationLedgerRecord => record !== null);
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const records = await fetchCitationLedger();
  return {
    totalDatasetsSecured: records.length,
    globalFacultiesConnected: new Set(records.map((record) => record.faculty)).size,
    totalEgressSaved: 'Calculated On-Chain',
  };
}

export async function fetchRecentActivity(): Promise<RecentActivityRecord[]> {
  return fetchCitationLedger();
}

export function verifyCitationHash(hash: string): Promise<AuditMessageResponse> {
  return request<AuditMessageResponse>('/audit/verify', {
    method: 'POST',
    body: JSON.stringify({ hash }),
  });
}

export async function submitDatasetToContract(
  title: string,
  faculty: string,
  researcher: string,
  shelbyHash: string,
  signAndSubmitTransaction: (transaction: TransactionPayload) => Promise<{ hash: string }>,
) {
  const response = await signAndSubmitTransaction({
    data: {
      function: `${CONTRACT_ADDRESS}::registry::log_dataset`,
      functionArguments: [title, faculty, researcher, shelbyHash],
    },
  });

  return { hash: response.hash };
}
