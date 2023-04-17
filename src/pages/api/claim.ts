import { claimNonce } from "@/services/claim";
import { errorStatus, errors, isApiMethod } from "@/services/errors";
import { createNonce } from "@/services/nonce";
import { NextApiHandler } from "next";

const handler = (async (req, res) => {
  if (!isApiMethod(req, res, "POST")) return;

  const { nonce } = JSON.parse(req.body);

  if (!nonce) {
    const error = errors.MISSING_NONCE;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  const claim = await claimNonce(req.socket, nonce);
  if (!claim) {
    const error = errors.INVALID_NONCE;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  res.status(200).json({ claim });
}) satisfies NextApiHandler;

export default handler;
