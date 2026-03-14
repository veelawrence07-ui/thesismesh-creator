import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 
import { Network } from "@aptos-labs/ts-sdk";   // ← ADD THIS IMPORT

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // Optional: Keep this if you need the Aptos client later (signing, balance checks, etc.)
    const aptosConfig = new AptosConfig({
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
    });
    const aptos = new Aptos(aptosConfig);

    // FIXED ShelbyClient — network + custom indexer
    const shelby = new ShelbyClient({
      network: Network.TESTNET,                    // ← THIS FIXES THE ERROR
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
      // NO aptos, rpcEndpoint, or wallet here (SDK doesn't support them in constructor)
    });

    // Signer for Petra wallet micropayment popup
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
