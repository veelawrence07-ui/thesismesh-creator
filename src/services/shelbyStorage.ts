import { Aptos, AptosConfig, AccountAddress } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // 1. Custom Aptos routing (NO network flag, pointing purely to ShelbyNet)
    const aptosConfig = new AptosConfig({
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
    });
    const aptos = new Aptos(aptosConfig);

    // 2. Shelby config mapping strictly to the custom network indexer
    const shelby = new ShelbyClient({
      aptos: aptos,
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
    });

    // 3. YOUR FIX: Properly formatting the Aptos Account Address!
    const signer = {
      account: AccountAddress.from(walletAddress),
      signAndSubmitTransaction
    };

    // 4. YOUR FIX: The exact strict payload structure the SDK expects
    const uploadResult = await shelby.upload({
      signer,
      blobs: [{
        blobName: file.name,
        blobData: file
      }],
      expirationMicros: Date.now() * 1000 + (30 * 24 * 60 * 60 * 1_000_000) // 30 days
    });

    console.log("✅ SDK Upload Success!", uploadResult);

    // Return whatever ID the SDK gives back
    return uploadResult.blobId || uploadResult.hash || uploadResult.id;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
