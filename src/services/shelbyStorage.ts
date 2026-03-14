import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 
import { Network, AccountAddress } from "@aptos-labs/ts-sdk";   // ← AccountAddress added

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,                 // must be "0x..." format
  signAndSubmitTransaction: any          // from Petra wallet
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // Official ShelbyNet config (matches every Shelby docs example)
    const shelby = new ShelbyClient({
      network: Network.TESTNET,
      apiKey: SHELBY_API_KEY,
    });

    // FIXED SIGNER — AccountAddress.from() is the current API
    const signer = {
      account: AccountAddress.from(walletAddress),   // ← THIS FIXES THE ERROR
      signAndSubmitTransaction
    };

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
