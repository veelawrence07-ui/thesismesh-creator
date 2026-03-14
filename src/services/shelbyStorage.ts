import { Network, AccountAddress } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // ✅ Official ShelbyNet config (uses correct endpoints internally)
    const shelby = new ShelbyClient({
      network: Network.SHELBYNET,   // ← THIS IS THE PERMANENT FIX
      apiKey: SHELBY_API_KEY,
    });

    // Correct signer format (matches all docs)
    const signer = {
      account: AccountAddress.from(walletAddress),   // ← NOT accountAddress
      signAndSubmitTransaction
    };

    const uploadResult = await shelby.upload({
      signer,
      blobs: [{
        blobName: file.name,
        blobData: file
      }],
      expirationMicros: Date.now() * 1000 + (30 * 24 * 60 * 60 * 1_000_000) // 30 days
    });

    console.log("✅ Upload Success!", uploadResult);
    return uploadResult.blobId || uploadResult.hash || uploadResult.id;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
