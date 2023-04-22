import { request, Variables } from "graphql-request";
import OwnerQuery from "./graphql/OwnerQuery.graphql";

const goldskyEndpoint =
  "https://api.goldsky.com/api/public/project_clgolh2qx3hyt49x52bdk07j6/subgraphs/tokengate-kiosk-dora/0.0.6/gn";

export interface Owner {
  id: string;
  tokens: {
    id: string;
    uri: string;
    contract: {
      id: string;
      name: string;
      symbol: string;
      createdBlock: string;
      createdAt: string;
      updatedBlock: string;
      updatedAt: string;
    };
    createdBlock: string;
    createdAt: string;
    updatedBlock: string;
    updatedAt: string;
  }[];
  createdBlock: string;
  createdAt: string;
  updatedBlock: string;
  updatedAt: string;
}

export interface OwnerResponse {
  owner?: Owner;
}

export function fetchOwner(id: string) {
  return request<OwnerResponse>(goldskyEndpoint, OwnerQuery, {
    id: id.toLowerCase(),
  });
}
