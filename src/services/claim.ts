import dayjs from "dayjs";
import { Claim } from "./types";
import { writeClaim } from "@/data/claims";
import { Socket } from "net";

export async function claimNonce(socket: Socket, nonce: string) {
  if (!nonce) return;

  const claim: Claim = {
    nonce,
    createdAt: dayjs().toISOString(),
  };

  await writeClaim(socket, claim);

  return claim;
}
