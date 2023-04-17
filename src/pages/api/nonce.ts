import { isApiMethod } from "@/services/errors";
import { createNonce } from "@/services/nonce";
import { NextApiHandler } from "next";

const handler = ((req, res) => {
  if (!isApiMethod(req, res, "GET")) return;

  const nonce = createNonce();

  res.status(200).json({ nonce });
}) satisfies NextApiHandler;

export default handler;
