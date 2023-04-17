import { readClaim, writeClaim } from "@/data/claims";
import { claimNonce } from "@/services/claim";
import { isApiMethod } from "@/services/errors";
import { createNonce } from "@/services/nonce";
import dayjs from "dayjs";
import { NextApiHandler } from "next";

const handler = (async (req, res) => {
  if (!isApiMethod(req, res, "POST")) return;

  const { action, ...data } = JSON.parse(req.body);

  if (action === "claim") {
    const { nonce } = data;
    await claimNonce(req.socket, nonce);
  } else if (action === "sign") {
    const { nonce, wallet, signature } = data;
    const claim = await readClaim(req.socket, nonce);

    if (claim) {
      await writeClaim(req.socket, {
        ...claim,
        wallet,
        signature,
        signedAt: dayjs().toISOString(),
      });
    }
  } else {
    await readClaim(req.socket, "");
  }

  res.status(200).json({ ...req.socket.server.data });
}) satisfies NextApiHandler;

export default handler;
