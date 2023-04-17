import { errors, errorStatus, isApiMethod } from "@/services/errors";
import {
  isClaimed,
  isExpired,
  isPassed,
  isSigned,
  isValidNonce,
} from "@/services/verify";
import dayjs from "dayjs";
import { NextApiHandler } from "next";

const handler = (async (req, res) => {
  if (!isApiMethod(req, res, "POST")) return;

  const { nonce } = JSON.parse(req.body);
  if (!nonce) {
    const error = errors.MISSING_NONCE;
    res.status(errorStatus[error]).json({ error });
    return;
  }

  if (!isValidNonce(nonce)) {
    const error = errors.INVALID_NONCE;
    res.status(errorStatus[error]).json({ error, nonce });
    return;
  }

  const claim = await isClaimed(req.socket, nonce);

  if (!claim) {
    res.status(200).json({ nonce });
    return;
  }

  if (isExpired(claim)) {
    res.status(200).json({ nonce, claim, expired: true });
    return;
  }

  if (!isSigned(claim)) {
    res.status(200).json({ nonce, claim });
    return;
  }

  const passedAt = isPassed(claim);

  if (!passedAt) {
    res.status(200).json({ nonce, claim });
    return;
  }

  res
    .status(200)
    .json({ nonce, claim, passedAt: dayjs(passedAt).toISOString() });
}) satisfies NextApiHandler;

export default handler;
