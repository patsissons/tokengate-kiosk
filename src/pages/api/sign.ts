import { verifySignature } from "@/services/sign";
import { errors, errorStatus, isApiMethod } from "@/services/errors";
import { NextApiHandler } from "next";
import { readClaim, writeClaim } from "@/data/claims";
import dayjs from "dayjs";

const handler = (async (req, res) => {
  if (!isApiMethod(req, res, "POST")) return;

  const { nonce, wallet, signature } = JSON.parse(req.body);

  if (!nonce) {
    const error = errors.MISSING_NONCE;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  if (!wallet) {
    const error = errors.MISSING_WALLET;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  if (!signature) {
    const error = errors.MISSING_SIGNATURE;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  if (!verifySignature(nonce, wallet, signature)) {
    const error = errors.INVALID_SIGNATURE;
    res.status(errorStatus[error]).json({ error, nonce, wallet, signature });
    return;
  }

  const claim = await readClaim(req.socket, nonce);

  if (!claim) {
    const error = errors.INVALID_NONCE;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  const signed = await writeClaim(req.socket, {
    ...claim,
    wallet,
    signature,
    signedAt: dayjs().toISOString(),
  });

  res.status(200).json({ claim: signed });
}) satisfies NextApiHandler;

export default handler;
