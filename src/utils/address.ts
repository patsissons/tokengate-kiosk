import { Address } from "wagmi";

export function shortAddress(address: Address | string, size = 4) {
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}
