import { AccountAddress } from "@aptos-labs/ts-sdk"; // 🚨 Removed Network entirely
import { ShelbyClient } from "@shelby-protocol/sdk/browser";

type TransactionPayload = {
  data: {
    function: string;
    functionArguments: unknown[];
  };
};

type SignAndSubmitTransaction = (
  transaction: TransactionPayload,
) => Promise<{ hash: string } | Record<string, unknown>>;

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";
const SHELBYNET_INDEXER_ENDPOINT = "https://api.shelbynet.shelby.xyz/v1/graphql";

const THIRTY_DAYS_IN_MICROS = 30 * 24 * 60 * 60 * 1_000_000;

function resolveUploadId(uploadResult: unknown): string {
  if (!uploadResult || typeof uploadResult !== "object") {
    throw new Error("Shelby upload returned an invalid response payload.");
  }

  const result = uploadResult as {
    blobId?: unknown;
    hash?: unknown;
    id?: unknown;
  };

  const candidate = result.blobId ?? result.hash ?? result.id;
  if (typeof candidate !== "string" || candidate.length === 0) {
    throw new Error("Shelby upload did not return blobId/hash/id.");
  }

  return candidate;
}

export async function uploadFileToShelby(
  file: File,
  walletAddress: string,
  signAndSubmitTransaction: SignAndSubmitTransaction,
): Promise<string> {
  if (!walletAddress || typeof walletAddress !== "string") {
    throw new Error("A valid wallet address string is required for Shelby uploads.");
  }

  if (typeof signAndSubmitTransaction !== "function") {
    throw new Error("signAndSubmitTransaction must be a function.");
  }

  // 🚨 THE FIX: Absolute minimal config. 
  // No network flags, no fullnode injections. We let Shelby handle it.
  const shelby = new ShelbyClient({
    indexer: {
      endpoint: SHELBYNET_INDEXER_ENDPOINT,
    },
    apiKey: SHELBY_API_KEY,
  });

  const signer = {
    accountAddress: AccountAddress.from(walletAddress),
    signAndSubmitTransaction,
  };

  const uploadResult = await shelby.upload({
    signer,
    blobs: [
      {
        blobName: file.name,
        blobData: file,
      },
    ],
    expirationMicros: Date.now() * 1000 + THIRTY_DAYS_IN_MICROS,
  });

  return resolveUploadId(uploadResult);
}
