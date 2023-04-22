import { Address } from "wagmi";

export interface Claim {
  createdAt: string;
  nonce: string;
  wallet?: string;
  signature?: string;
  signedAt?: string;
}

export interface SignedClaim extends Claim {
  wallet: Address;
  signature: string;
  signedAt: string;
}

export interface GateRequirement {
  holding: string;
  amount?: number;
}

export interface Gate {
  name: string;
  requirements: GateRequirement[];
}
