import { Network } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK to upload ${file.name}...`);

    const shelby = new ShelbyClient({
      network: Network.CUSTOM, 
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      // 🚨 THE FIX: Nesting the URL inside an object under the "endpoint" key
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
      apiKey: SHELBY_API_KEY,
      wallet: {
        address: walletAddress,
        signAndSubmitTransaction: signAndSubmitTransaction
      }
    });
    
    // 3. The Magic Command
    const uploadResult = await shelby.upload({
      file: file,
      expiration: "30d", 
    });

    console.log("✅ SDK Upload Success!", uploadResult);

    return uploadResult.blobId || uploadResult.hash;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
