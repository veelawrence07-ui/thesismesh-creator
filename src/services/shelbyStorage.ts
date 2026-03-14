import { AccountAddress } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // 🚨 The absolute minimal, doc-approved configuration.
    // We remove ALL custom overrides (no aptos, no fullnode, no network flag)
    // so the SDK falls back to its native ShelbyNet routing seamlessly.
    const shelby = new ShelbyClient({
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
    });

    // Your perfectly formatted signer and transaction payload
    const signer = {
      account: AccountAddress.from(walletAddress),
      signAndSubmitTransaction
    };

    const uploadResult = await shelby.upload({
      signer,
      blobs: [{
        blobName: file.name,
        blobData: file
      }],
      expirationMicros: Date.now() * 1000 + (30 * 24 * 60 * 60 * 1_000_000)
    });

    console.log("✅ SDK Upload Success!", uploadResult);

    return uploadResult.blobId || uploadResult.hash || uploadResult.id;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
