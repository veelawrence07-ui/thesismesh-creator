import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 
import { Network } from "@aptos-labs/ts-sdk";   // ← MUST be imported

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // ✅ ShelbyClient with the correct ShelbyNet network (no custom indexer!)
    const shelby = new ShelbyClient({
      network: Network.SHELBYNET,     // ← THIS IS THE KEY FIX
      apiKey: SHELBY_API_KEY,
    });

    // Signer for Petra wallet (triggers micropayment popup)
    const signer = {
      account: { address: walletAddress },
      signAndSubmitTransaction
    };

    // Upload with correct params
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
