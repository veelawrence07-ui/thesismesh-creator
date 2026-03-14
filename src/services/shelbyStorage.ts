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

    // 1. We MUST use Network.CUSTOM when providing custom ShelbyNet URLs.
    // This stops the 401 error AND stops the "require a network" error.
    const shelby = new ShelbyClient({
      network: Network.CUSTOM,
      fullnode: "https://api.shelbynet.shelby.xyz/v1",
      rpcEndpoint: "https://api.shelbynet.shelby.xyz/shelby",
      indexer: {
        endpoint: "https://api.shelbynet.shelby.xyz/v1/graphql"
      },
      apiKey: SHELBY_API_KEY,
    });

    // 2. The perfectly formatted signer (fixes the toStringLongWithoutPrefix error)
    const signer = {
      accountAddress: AccountAddress.from(walletAddress),
      signAndSubmitTransaction
    };

    // 3. The strict upload payload
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
