import { Claim, SignedClaim } from "@/services/types";
import { isExpired } from "@/services/verify";
import dayjs from "dayjs";
import { Socket } from "net";

type Claims = Record<string, Claim | SignedClaim | undefined>;
type ServerData = {
  claims?: Claims;
  nonces: string[];
  initializedAt: string;
};

declare module "net" {
  interface Socket {
    server: Server & {
      data?: ServerData;
    };
  }
}

function loadData(socket: Socket) {
  if (!socket.server.data) {
    socket.server.data = {
      initializedAt: dayjs().toISOString(),
      nonces: [],
    };
  }

  return socket.server.data;
}

function loadClaims(data: ServerData) {
  if (!data.claims) {
    data.claims = {};
  }

  reapExpired(data);

  return data.claims;
}

function reapExpired(data: ServerData) {
  if (!data.claims || data.nonces.length === 0) return;

  while (data.nonces.length > 0) {
    const [nonce] = data.nonces;
    if (!nonce) {
      data.nonces.shift();
      continue;
    }

    const claim = data.claims[nonce];
    if (!claim) {
      data.nonces.shift();
      continue;
    }

    if (!isExpired(claim)) break;

    delete data.claims[nonce];
    data.nonces.shift();
    console.log("reaped", claim, data);
  }
}

export async function readClaim(
  socket: Socket,
  nonce: string
): Promise<Claim | SignedClaim | undefined> {
  const data = loadData(socket);
  const claims = loadClaims(data);

  if (!nonce) return;
  const claim = claims[nonce];
  // console.log("read", claim, data);
  return claim;
}

export async function writeClaim(socket: Socket, claim: Claim | SignedClaim) {
  const data = loadData(socket);
  const claims = loadClaims(data);

  if (!claim.nonce) return;
  if (!(claim.nonce in claims)) {
    data.nonces.push(claim.nonce);
  }

  claims[claim.nonce] = claim;
  console.log("write", claim, data);
  return claim;
}
