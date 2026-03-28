const WALRUS_PUBLISHER = "[https://publisher.walrus-testnet.walrus.space](https://publisher.walrus-testnet.walrus.space)";
const EPOCHS = 30;

export async function uploadFileToWalrus(file: File): Promise<string> {
  try {
    console.log(`⬆️ Uploading ${file.name} to Walrus Network...`);
    
    const response = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=${EPOCHS}`, {
      method: "PUT",
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Walrus HTTP Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    const blobId = data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;

    if (!blobId) {
      throw new Error("Failed to extract Blob ID from Walrus response.");
    }

    console.log("✅ Walrus Upload Success! Blob ID:", blobId);
    return blobId;
  } catch (error) {
    console.error("❌ Walrus Upload Error:", error);
    throw error;
  }
}
