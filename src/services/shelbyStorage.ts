import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
// Import the core browser client from the SDK you installed
import { ShelbyClient } from "@shelby-protocol/sdk"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK to upload ${file.name}...`);

    // 1. Tell the Aptos SDK to look at ShelbyNet
    const aptosConfig = new AptosConfig({
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql",
    });
    const aptos = new Aptos(aptosConfig);

    // 2. Initialize the official Shelby SDK
    const shelby = new ShelbyClient({
      aptos,
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
      apiKey: SHELBY_API_KEY,
      // We hand the SDK your wallet so it can handle the 402 Micropayment automatically
      wallet: {
        address: walletAddress,
        signAndSubmitTransaction: signAndSubmitTransaction
      }
    });

    // 3. The Magic Command: This single function creates the channel, gets the session, 
    // triggers your Petra wallet for the fee, and uploads the file!
    const uploadResult = await shelby.upload({
      file: file,
      expiration: "30d", // Required by ShelbyNet
    });

    console.log("✅ SDK Upload Success!", uploadResult);

    // Return the cryptographic blob ID to store on your Thesismesh smart contract
    return uploadResult.blobId || uploadResult.hash;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
