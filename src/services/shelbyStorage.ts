import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK to upload ${file.name}...`);

    // 1. Build the custom Aptos connection
    const aptosConfig = new AptosConfig({
      network: Network.CUSTOM, // 🚨 The magic flag we missed earlier!
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql",
    });
    const aptos = new Aptos(aptosConfig);

    // 2. Hand the fully configured Aptos client to Shelby
    const shelby = new ShelbyClient({
      aptos: aptos,
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
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
