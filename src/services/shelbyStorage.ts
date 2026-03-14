// 🚨 FIXED: Now pointing to the official ShelbyNet URL!
const SHELBY_API_BASE = "https://api.shelbynet.shelby.xyz/shelby";
const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? "";

export async function uploadFileToShelby(file: File, sessionId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log(`⬆️ Uploading ${file.name} to Shelby Storage...`);

    const headers: Record<string, string> = {
      "X-Shelby-Session": sessionId,
      "x-expiration-seconds": "2592000",
    };

    if (SHELBY_API_KEY) {
      headers["Authorization"] = `Bearer ${SHELBY_API_KEY}`;
    } else {
      console.warn("⚠️ VITE_SHELBY_API_KEY is missing. Upload request may fail.");
    }

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

export function getShelbyBlobUrl(accountAddress: string, blobName: string): string {
  return `${SHELBY_API_BASE}/v1/blobs/${accountAddress}/${blobName}`;
}
