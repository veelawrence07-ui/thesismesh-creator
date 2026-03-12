import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const SHELBYNET_FULLNODE_URL = "https://api.shelbynet.shelby.xyz/v1";
export const SHELBYNET_INDEXER_URL = `${SHELBYNET_FULLNODE_URL}/graphql`;

// The Wallet Adapter expects `aptosApiUrl` for custom endpoints
export const aptosDappConfig = {
  network: Network.CUSTOM,
  aptosApiUrl: SHELBYNET_FULLNODE_URL,
};

// Added the indexer URL so your read path (Dashboard) works perfectly
export const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: SHELBYNET_FULLNODE_URL,
  indexer: SHELBYNET_INDEXER_URL,
});
