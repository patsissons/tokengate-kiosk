import { NextApiRequest, NextApiResponse } from "next";

export const errors = {
  MISSING_NONCE: "MISSING_NONCE",
  MISSING_WALLET: "MISSING_WALLET",
  MISSING_SIGNATURE: "MISSING_SIGNATURE",
  INVALID_NONCE: "INVALID_NONCE",
  INVALID_SIGNATURE: "INVALID_SIGNATURE",
} as const;

export const errorStatus: Record<(typeof errors)[keyof typeof errors], number> =
  {
    // 400: Bad Request
    [errors.MISSING_NONCE]: 400,
    [errors.MISSING_WALLET]: 400,
    [errors.MISSING_SIGNATURE]: 400,
    [errors.INVALID_NONCE]: 400,

    // 401: Unauthorized
    [errors.INVALID_SIGNATURE]: 401,
  };

export function isApiMethod(
  req: NextApiRequest,
  res: NextApiResponse,
  method: NextApiRequest["method"]
) {
  if (req.method !== method) {
    res.status(405).end();
    return false;
  }

  return true;
}
