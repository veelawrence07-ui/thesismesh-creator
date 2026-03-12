const SHELBY_API_BASE = "https://api.shelbynet.shelby.xyz/shelby";

/**
 * Uploads a file to the real Shelbynet Storage network.
 * @param file The file object from the browser input
 * @param sessionId A valid session ID obtained from createSession
 */
export async function uploadFileToShelby(file: File, sessionId: string): Promise<string> {
  // 1. Prepare the form data
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log(`⬆️ Uploading ${file.name} to Shelby Storage...`);

    // 2. Execute the upload request
    const response = await fetch(`${SHELBY_API_BASE}/v1/blobs/upload`, {
      method: "POST",
      headers: {
        // We pass the Session ID so Shelby knows which micropayment channel to bill
        "X-Shelby-Session": sessionId,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shelby Upload Failed: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Shelby Upload Success:", data);

    // 3. Return the real cryptographic hash (blob ID) returned by the network
    // Note: Adjust 'data.blobId' based on the exact key in the Shelbynet JSON response
    const finalHash = data.blobId || data.hash || data.blobName;

    if (!finalHash) {
      throw new Error("Upload succeeded but no Blob ID was returned from Shelby.");
    }

    return finalHash;
  } catch (error) {
    console.error("❌ Shelby Storage Error:", error);
    throw error;
  }
}

/**
 * Helper to generate a retrieval URL for the Dashboard
 */
export function getShelbyBlobUrl(accountAddress: string, blobName: string): string {
  return `${SHELBY_API_BASE}/v1/blobs/${accountAddress}/${blobName}`;
}
