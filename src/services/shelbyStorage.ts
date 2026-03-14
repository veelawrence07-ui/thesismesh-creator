import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any  // ← from Petra wallet adapter
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // 1. Custom Aptos (required for ShelbyNet)
    const aptosConfig = new AptosConfig({
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
    });
    const aptos = new Aptos(aptosConfig);  // kept for future use if needed

    // 2. ShelbyClient — ONLY supported config + indexer override
    const shelby = new ShelbyClient({
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
      // NO aptos, NO rpcEndpoint, NO wallet here (SDK doesn't support it)
    });

    // 3. Prepare signer (Petra-style — this triggers micropayment wallet popup)
    const signer = {
      account: { address: walletAddress },
      signAndSubmitTransaction
    };

    // 4. Upload with correct documented params
    const uploadResult = await shelby.upload({
      signer,                                   // ← required for wallet signing
      blobs: [{
        blobName: file.name,                    // or any custom name
        blobData: file                          // File object works in browser
      }],
      expirationMicros: Date.now() * 1000 + (30 * 24 * 60 * 60 * 1_000_000)  // 30 days in microseconds
    });

    console.log("✅ Upload Success!", uploadResult);
    return uploadResult.blobId || uploadResult.hash || uploadResult.id;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
