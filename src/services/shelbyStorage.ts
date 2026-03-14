import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK to upload ${file.name}...`);

    // 1. Custom Aptos client (Flat strings, NO network flag)
    const aptosConfig = new AptosConfig({
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
    });
    const aptos = new Aptos(aptosConfig);

    // 2. Shelby client (Indexer MUST be an object here!)
    const shelby = new ShelbyClient({
      aptos: aptos,
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
      wallet: {
        address: walletAddress,
        signAndSubmitTransaction: signAndSubmitTransaction
      }
    });
    
    // 3. Upload and trigger the Petra Wallet micropayment
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
