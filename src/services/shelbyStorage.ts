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

    // 1. OVERRIDE TESTNET: We keep the Testnet flag but force the URLs to ShelbyNet
    // so your Geomi API key doesn't get rejected by Aptos Labs.
    const aptosConfig = new AptosConfig({
      network: Network.TESTNET,
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      indexer: "https://api.shelbynet.shelby.xyz/v1/graphql"
    });
    const aptos = new Aptos(aptosConfig);

    // 2. Pass the overridden Aptos client into Shelby
    const shelby = new ShelbyClient({
      aptos: aptos,
      apiKey: SHELBY_API_KEY,
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      }
    });

    // 3. Your perfectly formatted signer
    const signer = {
      accountAddress: AccountAddress.from(walletAddress),
      signAndSubmitTransaction
    };

    // 4. The strict upload payload
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
