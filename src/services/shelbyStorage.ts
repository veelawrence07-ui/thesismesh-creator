import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 
import { Network, AccountAddress } from "@aptos-labs/ts-sdk";   // ← ADD AccountAddress

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,                 // e.g. "0x123..."
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    const shelby = new ShelbyClient({
      network: Network.TESTNET,   // correct & documented for ShelbyNet
      apiKey: SHELBY_API_KEY,
    });

    // FIXED SIGNER — this is the exact format the docs use for Petra/wallet adapters
    const signer = {
      account: AccountAddress.fromHex(walletAddress),   // ← THIS WAS THE MISSING PIECE
      signAndSubmitTransaction
    };

    const uploadResult = await shelby.upload({
      signer,
      blobs: [{
        blobName: file.name,
        blobData: file                          // Browser SDK handles File objects
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
