import dayjs from "dayjs";
import { Claim, SignedClaim } from "./types";
import { claimLifetime, noncePattern } from "./constants";
import { readClaim } from "@/data/claims";
import { Socket } from "net";

export function isValidNonce(nonce: string) {
  return nonce.length === 36 && noncePattern.test(nonce);
}

export async function isClaimed(socket: Socket, nonce: string) {
  const claim = await readClaim(socket, nonce);

  return claim;
}

export function isExpired(claim: Claim) {
  return dayjs(claim.createdAt).diff() + claimLifetime < 0;
}

export function isSigned(claim: Claim): claim is SignedClaim {
  return Boolean(claim.wallet && claim.signature && claim.signedAt);
}

export function isPassed(claim: SignedClaim) {
  const walletPassed = Boolean(claim.wallet && claim.signature);

  if (walletPassed) {
    return dayjs().toISOString();
  }
}
