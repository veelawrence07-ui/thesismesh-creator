import * as ShelbySDK from "@shelby-protocol/sdk";

const SHELBY_RPC_URL = "https://api.shelbynet.shelby.xyz/shelby";

type ShelbyUploadResult = {
  blobName?: string;
  blobId?: string;
  id?: string;
  hash?: string;
};

let clientInstance: unknown;

function getShelbyClient(): any {
  if (clientInstance) {
    return clientInstance;
  }

  const sdk = ShelbySDK as Record<string, unknown>;
  const CandidateClient = sdk.ShelbyClient ?? sdk.Client ?? sdk.Shelby ?? sdk.default;

  if (!CandidateClient || typeof CandidateClient !== "function") {
    throw new Error("Shelby SDK client constructor was not found.");
  }

  clientInstance = new (CandidateClient as new (config: { rpcUrl: string }) => unknown)({
    rpcUrl: SHELBY_RPC_URL,
  });

  return clientInstance;
}

function extractBlobIdentifier(uploadResult: unknown): string {
  if (typeof uploadResult === "string") {
    return uploadResult;
  }

  if (!uploadResult || typeof uploadResult !== "object") {
    throw new Error("Shelby SDK returned an invalid upload response.");
  }

  const typedResult = uploadResult as ShelbyUploadResult;
  const blobIdentifier = typedResult.blobName ?? typedResult.blobId ?? typedResult.id ?? typedResult.hash;

  if (!blobIdentifier) {
    throw new Error("Shelby SDK response did not include a blob identifier.");
  }

  return blobIdentifier;
}

export async function uploadFileToShelby(file: File): Promise<string> {
  const client = getShelbyClient();

  if (typeof client.uploadFile === "function") {
    const uploadResult = await client.uploadFile(file);
    return extractBlobIdentifier(uploadResult);
  }

  if (typeof client.fileUpload === "function") {
    const uploadResult = await client.fileUpload(file);
    return extractBlobIdentifier(uploadResult);
  }

  if (typeof client.uploadBlob === "function") {
    const uploadResult = await client.uploadBlob(file);
    return extractBlobIdentifier(uploadResult);
  }

  throw new Error("No supported file upload method found on Shelby SDK client.");
}
