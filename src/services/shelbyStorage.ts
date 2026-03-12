// Updated to the official testnet URL!
const SHELBY_API_BASE = "https://api.testnet.shelby.xyz/shelby";
// Grab the Client Key you generated on Geomi
const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

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

    // Prepare headers (Do NOT manually set Content-Type when sending FormData)
    const headers: Record<string, string> = {
      // Pass the Session ID so Shelby knows which micropayment channel to bill
      "X-Shelby-Session": sessionId,
      // REQUIRED: Shelby requires explicit expiration on all uploads (30 days in seconds)
      "x-expiration-seconds": "2592000",
    };

    // Inject the API key to bypass Geomi rate limits and auth walls
    if (SHELBY_API_KEY) {
      headers["Authorization"] = `Bearer ${SHELBY_API_KEY}`;
    } else {
      console.warn("⚠️ VITE_SHELBY_API_KEY is missing. Upload request may fail.");
    }

    // 2. Execute the upload request
    const response = await fetch(`${SHELBY_API_BASE}/v1/blobs/upload`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shelby Upload Failed: ${errorText || response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Shelby Upload Success:", data);

    // 3. Return the real cryptographic hash (blob ID) returned by the network
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
