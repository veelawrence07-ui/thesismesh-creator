// Updated to the official testnet URL!
const SHELBY_API_URL = "https://api.testnet.shelby.xyz/shelby"; 
// Grab the Client Key you generated on Geomi
const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? ""; 

export async function createShelbySession(walletAddress: string) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Inject the API key to bypass rate limits and auth walls
    if (SHELBY_API_KEY) {
      headers["Authorization"] = `Bearer ${SHELBY_API_KEY}`;
    } else {
      console.warn("⚠️ VITE_SHELBY_API_KEY is missing. Session request may fail.");
    }

    const response = await fetch(`${SHELBY_API_URL}/v1/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userAddress: walletAddress,
        requestedChunksets: 5
      }),
    });

    if (response.status === 402) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    if (!response.ok) {
      throw new Error("SESSION_FAILED");
    }

    return await response.json();
  } catch (error: any) {
    console.error("❌ Shelby Session Error:", error);
    throw error;
  }
}
