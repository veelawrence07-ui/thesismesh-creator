import { AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const SHELBYNET_FULLNODE_URL = "https://api.shelbynet.shelby.xyz/v1";
export const SHELBYNET_INDEXER_URL = `${SHELBYNET_FULLNODE_URL}/graphql`;

export const aptosDappConfig = {
  network: Network.CUSTOM,
  fullnode: SHELBYNET_FULLNODE_URL,
} as const;

export const aptosConfig = new AptosConfig({
  network: Network.CUSTOM,
  fullnode: SHELBYNET_FULLNODE_URL,
});
