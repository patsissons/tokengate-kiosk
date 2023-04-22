import dayjs from "dayjs";
import { NextApiHandler } from "next";
import { verifySignature } from "@/services/sign";
import { errors, errorStatus, isApiMethod } from "@/services/errors";
import { readClaim, writeClaim } from "@/data/claims";
import { isPassed } from "@/services/verify";
import { SignedClaim } from "@/services/types";

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

  const signed: SignedClaim = {
    ...claim,
    wallet,
    signature,
    signedAt: dayjs().toISOString(),
  };

  await writeClaim(req.socket, signed);

  const { owner, passedAt } = await isPassed(signed);
  if (!owner || !passedAt) {
    const error = errors.INVALID_WALLET;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  res.status(200).json({ claim: signed, owner, passedAt });
}) satisfies NextApiHandler;

export default handler;
