// Updated to the official ShelbyNet URL!
const SHELBY_API_URL = "https://api.shelbynet.shelby.xyz/shelby"; 
const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? ""; 

export async function createShelbySession(
  walletAddress: string, 
  signAndSubmitTransaction: any // 👈 We are passing your wallet right into the function!
) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (SHELBY_API_KEY) {
      headers["Authorization"] = `Bearer ${SHELBY_API_KEY}`;
    }

    // 1. Ask the server for the upload session
    const response = await fetch(`${SHELBY_API_URL}/v1/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userAddress: walletAddress,
        requestedChunksets: 5
      }),
    });

    // 🚨 THE MAGIC FIX: Handling the Web3 Invoice 🚨
    if (response.status === 402) {
      console.log("🧾 402 Payment Required: Received invoice from ShelbyNet!");
      const invoiceData = await response.json();
      
      // The server gave us the Aptos transaction payload required to pay for the session.
      // We ask Petra Wallet to sign and pay it!
      const pendingTxn = await signAndSubmitTransaction({
        data: invoiceData.payload || invoiceData.transactionPayload 
      });

      console.log("✅ Payment successful! Txn Hash:", pendingTxn.hash);

      // Return the paid session data back to your frontend
      return invoiceData; 
    }

    if (!response.ok) {
      throw new Error("SESSION_FAILED");
    }

    return await response.json();
  } catch (error: any) {
    console.error("❌ Shelby Session Error:", error);
    throw error;
  }
}`````````````````````````````
