import { createSigningMessage } from "@/services/sign";
import { Claim, SignedClaim } from "@/services/types";
import { shortAddress } from "@/utils/address";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { verifyMessage } from "ethers/lib/utils.js";
import { useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { Verified } from "./Verified";

interface Props {
  claim: Claim;
}

export function Verifier({ claim }: Props) {
  const [wallet, setWallet] = useState<string>();
  const [signed, setSigned] = useState<SignedClaim>();

  const { address, isConnected } = useAccount({
    onDisconnect() {
      setWallet(undefined);
      setSigned(undefined);
    },
  });
  const { error, isLoading, signMessage } = useSignMessage({
    async onSuccess(data, variables) {
      const address = verifyMessage(variables.message, data);
      if (address === wallet) {
        console.log("signed", data);

        const response = await fetch("/api/sign", {
          method: "POST",
          body: JSON.stringify({ nonce: claim.nonce, wallet, signature: data }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error);
        }

        const { claim: signed } = (await response.json()) as {
          claim: SignedClaim;
        };

        setSigned(signed);
      } else {
        throw new Error("invalid signature");
      }
    },
  });

  useEffect(() => {
    if (isConnected && address) {
      setWallet(address);
    }
  }, [address, isConnected]);

  return (
    <div className="flex flex-col gap-4 items-center max-w-xs">
      <ConnectButton showBalance={false} />
      {renderVerifier()}
      {error && <p className="text-red-500">{error.message}</p>}
      {signed && <Verified claim={signed} />}
    </div>
  );

  function renderVerifier() {
    if (!isConnected || signed || !wallet) return;

    return (
      <button
        className={`btn btn-secondary btn-lg btn-wide ${
          isLoading ? "loading" : ""
        }`}
        onClick={handleVerify}
      >
        Verify&nbsp;
        <span className="font-mono">{shortAddress(wallet)}</span>
      </button>
    );
  }

  function handleVerify() {
    const message = createSigningMessage(claim.nonce);

    signMessage({ message });
  }
}
