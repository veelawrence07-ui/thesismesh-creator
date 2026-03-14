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

    // ✅ Official documented config — this is the ONLY supported way
    const shelby = new ShelbyClient({
      network: Network.TESTNET,   // ← ShelbyNet prototype is accessed via TESTNET
      apiKey: SHELBY_API_KEY,
      // NO indexer, NO fullnode, NO rpcEndpoint, NO CUSTOM — nothing else
    });

    // Signer (already fixed in previous steps)
    const signer = {
      account: AccountAddress.from(walletAddress),
      signAndSubmitTransaction
    };

    // Upload (exact documented structure)
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
