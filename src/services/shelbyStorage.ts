import { Aptos, AptosConfig, Network, AccountAddress } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser"; 

const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(
  file: File, 
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> {
  try {
    console.log(`⬆️ Initializing SDK for ${file.name} on ShelbyNet...`);

    // 1. Aptos NEEDS the Network.CUSTOM flag to accept these URLs!
    const aptosConfig = new AptosConfig({
      network: Network.CUSTOM, 
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
    });
    const aptos = new Aptos(aptosConfig);

    // 2. Shelby MUST have the indexer formatted as an object
    const shelby = new ShelbyClient({
      aptos: aptos,
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
    });

    // 3. Your perfectly formatted AccountAddress payload
    const signer = {
      account: AccountAddress.from(walletAddress),
      signAndSubmitTransaction
    };

    // 4. The exact strict payload structure
    const uploadResult = await shelby.upload({
      signer,
      blobs: [{
        blobName: file.name,
        blobData: file
      }],
      expirationMicros: Date.now() * 1000 + (30 * 24 * 60 * 60 * 1_000_000)
    });

    console.log("✅ SDK Upload Success!", uploadResult);

    return uploadResult.blobId || uploadResult.hash || uploadResult.id;

  } catch (error) {
    console.error("❌ Shelby SDK Error:", error);
    throw error;
  }
}
