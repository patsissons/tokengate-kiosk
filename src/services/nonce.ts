import { randomBytes } from "ethers/lib/utils";
import { uuidV4 } from "@ethersproject/json-wallets/lib/utils";

export function createNonce() {
  return uuidV4(randomBytes(16));
}
