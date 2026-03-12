const SHELBY_API_URL = "https://api.shelbynet.shelby.xyz/shelby";

export async function createShelbySession(walletAddress: string) {
  try {
    const response = await fetch(`${SHELBY_API_URL}/v1/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAddress: walletAddress,
        requestedChunksets: 50 
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
