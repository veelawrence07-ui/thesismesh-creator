import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 
import { Network } from "@aptos-labs/ts-sdk";

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // ✅ Official & simplest config (no indexer, no custom anything)
    const shelby = new ShelbyClient({
      network: Network.TESTNET,   // ← this is what the docs use for ShelbyNet
      apiKey: SHELBY_API_KEY,
    });

    // Signer (triggers Petra micropayment popup automatically)
    const signer = {
      account: { address: walletAddress },
      signAndSubmitTransaction
    };

    // Upload (correct params)
    const uploadResult = await shelby.upload({
      signer,
      blobs: [{
        blobName: file.name,
        blobData: file
      }],
      expirationMicros: Date.now() * 1000 + (30 * 24 * 60 * 60 * 1_000_000)  // 30 days
    });

    console.log("✅ Upload Success!", uploadResult);
    return uploadResult.blobId || uploadResult.hash || uploadResult.id;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
