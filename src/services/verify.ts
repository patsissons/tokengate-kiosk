import dayjs from "dayjs";
import { Claim, SignedClaim } from "./types";
import { claimLifetime, noncePattern } from "./constants";
import { readClaim } from "@/data/claims";
import { Socket } from "net";
import { gates } from "./config";
import { Owner, fetchOwner } from "./graphql";
import { verifySignature } from "./sign";

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

export async function isPassed(
  claim: SignedClaim
): Promise<{ passedAt?: string; owner?: Owner }> {
  if (!verifySignature(claim.nonce, claim.wallet, claim.signature)) {
    console.log(`${claim.wallet} produced an invalid signature`);
    return {};
  }

  const { owner } = await fetchOwner(claim.wallet);
  if (!owner || owner.tokens.length === 0) {
    console.log(`${claim.wallet} holds no tokens`);
    return {};
  }

  const contractTokens = owner.tokens.reduce((map, { id, contract }) => {
    if (map.has(contract.id)) {
      map.get(contract.id)!.add(id);
    } else {
      map.set(contract.id, new Set([id]));
    }
    return map;
  }, new Map<string, Set<string>>());

  gates.forEach(({ name, requirements }) => {
    requirements.forEach(({ holding, amount = 1 }) => {
      const tokens = contractTokens.get(holding);
      if (!tokens || tokens.size < amount) {
        console.log(
          `${claim.wallet} holds ${
            tokens?.size ?? 0
          }/${amount} required ${name} tokens`
        );
        return;
      }
    });
  });

  return {
    passedAt: dayjs().toISOString(),
    owner,
  };
}
