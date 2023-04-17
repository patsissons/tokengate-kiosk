import Blockies from "react-blockies";
import Image from "next/image";
import { useEnsAvatar, useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { SignedClaim } from "@/services/types";
import { shortAddress } from "@/utils/address";
import dayjs from "dayjs";

const chainId = mainnet.id;

interface Props {
  claim: SignedClaim;
}

export function Verified({
  claim: { nonce, wallet: address, signature, signedAt },
}: Props) {
  const { data: ensAvatar, isLoading: ensAvatarLoading } = useEnsAvatar({
    address,
    chainId,
    enabled: true,
  });
  const { data: ensName, isLoading: ensNameLoading } = useEnsName({
    address,
    chainId,
    enabled: true,
  });

  const ensLoading = ensAvatarLoading || ensNameLoading;

  return (
    <div className="relative flex flex-col items-center justify-center gap-2 w-96 h-64 rounded-3xl overflow-hidden">
      <h2 className="text-lg text-green-500">Verified 🎉</h2>
      <div className="flex gap-2">
        {renderAvatar()}
        <Blockies seed={signature} size={24} scale={5} />
      </div>
      <p className="font-mono text-green-500">
        {shortAddress(address, 8)} @ {dayjs(signedAt).format("HH:mm:ss")}
      </p>
      <p className="font-mono text-green-500">{nonce}</p>
      <div className="absolute w-full h-full rounded-3xl bg-white/10 blur-sm" />
    </div>
  );

  function renderAvatar() {
    if (ensAvatar && ensName && !ensLoading) {
      return (
        <Image
          alt={`${ensName} avatar`}
          src={ensAvatar}
          width={120}
          height={120}
          unoptimized
        />
      );
    }

    return (
      <div className="relative">
        <Blockies seed={address} size={24} scale={5} />
        {ensLoading ? (
          <div className="absolute left-0 top-0 flex items-center justify-center w-full h-full">
            <div
              className="radial-progress animate-spin"
              style={{ "--value": 70 } as React.CSSProperties}
            />
          </div>
        ) : undefined}
      </div>
    );
  }
}
