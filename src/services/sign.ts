import { verifyMessage } from "ethers/lib/utils";

export function createSigningMessage(nonce: string) {
  return `Sign this message to claim this nonce: ${nonce}`;
}

export function verifySignature(
  nonce: string,
  wallet: string,
  signature: string
) {
  const message = createSigningMessage(nonce);
  const address = verifyMessage(message, signature);

  return address === wallet;
}
