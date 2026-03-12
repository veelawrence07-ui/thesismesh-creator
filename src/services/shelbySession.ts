const SHELBY_API_URL = "https://api.shelbynet.shelby.xyz/shelby";

export interface ShelbySession {
  id: string;
  expiresAt: number;
  chunksetsLeft: number;
}

/**
 * Creates a new Shelbynet storage session.
 * Requires the user to have an active micropayment channel.
 */
export async function createShelbySession(walletAddress: string): Promise<ShelbySession> {
  try {
    console.log("🎟️ Requesting Shelbynet session for:", walletAddress);

    const response = await fetch(`${SHELBY_API_URL}/v1/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAddress: walletAddress,
        requestedChunksets: 50 // Standard amount for research datasets
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Session failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      expiresAt: data.expiresAt,
      chunksetsLeft: data.chunksetsLeft,
    };
  } catch (error) {
    console.error("❌ Shelby Session Error:", error);
    throw error;
  }
}
