// Updated to the official ShelbyNet URL!
const SHELBY_API_URL = "https://api.shelbynet.shelby.xyz/shelby"; 
const SHELBY_API_KEY = import.meta.env.VITE_SHELBY_API_KEY ?? ""; 

export async function createShelbySession(
  walletAddress: string, 
  signAndSubmitTransaction: any
) {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (SHELBY_API_KEY) {
      headers["Authorization"] = `Bearer ${SHELBY_API_KEY}`;
    }

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
      
      // Let's look exactly at what the server handed us!
      console.log("🔍 INVOICE JSON:", invoiceData);
      
      // We will try a few common Web3 names for the payload
      const txData = invoiceData.payload || invoiceData.transactionPayload || invoiceData.payment_transaction || invoiceData.tx;

      if (!txData) {
        throw new Error("We caught the invoice, but couldn't find the payload! Please check the console log.");
      }

      // Pass the found payload to the wallet
      const pendingTxn = await signAndSubmitTransaction({
        data: txData 
      });

      console.log("✅ Payment successful! Txn Hash:", pendingTxn.hash);

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
}
