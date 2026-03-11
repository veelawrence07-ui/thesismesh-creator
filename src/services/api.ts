import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: "https://api.shelbynet.shelby.xyz/v1",
  indexer: "https://api.shelbynet.shelby.xyz/v1/graphql",
});

export const aptos = new Aptos(aptosConfig);
export const CONTRACT_ADDRESS =
  "0xda877009fc36736b2a3da44c4b3993ab1c9b47d390146a33e1299994b9738ea9";
const SHELBYNET_INDEXER_URL = "https://api.shelbynet.shelby.xyz/v1/graphql";

const GET_DATASET_EVENTS_QUERY = `
query GetDatasetEvents($contractAddress: String!) {
  events(
    where: {
      account_address: { _eq: $contractAddress },
      type: { _like: "%::registry::DatasetUploadedEvent" }
    }
    order_by: { transaction_version: desc }
  ) {
    transaction_version
    data
  }
}
`;

interface GraphQLError {
  message: string;
}

interface DatasetEventData {
  title: string;
  faculty: string;
  researcher: string;
  shelby_hash: string;
  upload_time: string | number;
}

interface DatasetEvent {
  transaction_version: number | string;
  data: DatasetEventData | string;
}

interface GetDatasetEventsResponse {
  data?: {
    events: DatasetEvent[];
  };
  errors?: GraphQLError[];
}

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
  researcher: string;
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
  faculty: string;
  cryptographicReceipt: string;
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

function formatMicrosecondsToDate(uploadTime: string | number): string {
  const timestamp = Number(uploadTime);

  if (!Number.isFinite(timestamp)) {
    return "Unknown date";
  }

  return new Date(Math.floor(timestamp / 1000)).toLocaleString();
}

function parseEventData(data: DatasetEvent["data"]): DatasetEventData | null {
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as DatasetEventData;
    } catch {
      return null;
    }
  }

  return data;
}

async function fetchDatasetEvents(): Promise<DatasetEvent[]> {
  const response = await fetch(SHELBYNET_INDEXER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_DATASET_EVENTS_QUERY,
      variables: {
        contractAddress: CONTRACT_ADDRESS,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `GraphQL request failed with status ${response.status}`);
  }

  const body = (await response.json()) as GetDatasetEventsResponse;

  if (body.errors?.length) {
    throw new Error(body.errors.map((error) => error.message).join(", "));
  }

  return body.data?.events ?? [];
}

function mapEventsToRecords(events: DatasetEvent[]): CitationLedgerRecord[] {
  return events
    .map((event) => {
      const data = parseEventData(event.data);

      if (!data) {
        return null;
      }

      return {
        id: String(event.transaction_version),
        datasetTitle: data.title,
        dateUploaded: formatMicrosecondsToDate(data.upload_time),
        faculty: data.faculty,
        researcher: data.researcher,
        cryptographicReceipt: data.shelby_hash,
      };
    })
    .filter((record): record is CitationLedgerRecord => record !== null);
}

export async function fetchCitationLedger(): Promise<CitationLedgerRecord[]> {
  const events = await fetchDatasetEvents();
  return mapEventsToRecords(events);
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const records = await fetchCitationLedger();
  const uniqueFaculties = new Set(records.map((record) => record.faculty));

  return {
    totalDatasetsSecured: records.length,
    globalFacultiesConnected: uniqueFaculties.size,
    totalEgressSaved: "Calculated On-Chain",
  };
}

export async function fetchRecentActivity(): Promise<RecentActivityRecord[]> {
  const records = await fetchCitationLedger();

  return records.map((record) => ({
    id: record.id,
    datasetTitle: record.datasetTitle,
    dateUploaded: record.dateUploaded,
    researcher: record.researcher,
    faculty: record.faculty,
    cryptographicReceipt: record.cryptographicReceipt,
  }));
}

export function verifyCitationHash(hash: string): Promise<AuditMessageResponse> {
  return request<AuditMessageResponse>("/audit/verify", {
    method: "POST",
    body: JSON.stringify({ hash }),
  });
}

export async function submitDatasetToContract(
  title: string,
  faculty: string,
  researcher: string,
  shelbyHash: string,
) {
  const wallet = (window as Window & {
    aptos?: {
      signAndSubmitTransaction: (transaction: {
        data: {
          function: string;
          functionArguments: string[];
        };
      }) => Promise<{ hash: string }>;
    };
  }).aptos;

  if (!wallet) {
    throw new Error("Petra wallet is not installed.");
  }

  const transaction = {
    data: {
      function: `${CONTRACT_ADDRESS}::registry::log_dataset`,
      functionArguments: [title, faculty, researcher, shelbyHash],
    },
  };

  const response = await wallet.signAndSubmitTransaction(transaction);
  const receipt = await aptos.waitForTransaction({ transactionHash: response.hash });

  return receipt;
}
