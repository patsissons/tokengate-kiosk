import { Verifier } from "@/components/Verifier";
import { GetServerSideProps } from "next";
import { Claim } from "@/services/types";
import { useEffect, useState } from "react";

interface Props {
  nonce: string;
}

export default function Verify({ nonce }: Props) {
  const [claim, setClaim] = useState<Claim>();

  useEffect(() => {
    fetch("/api/claim", {
      method: "POST",
      body: JSON.stringify({ nonce }),
    })
      .then((response) => response.json())
      .then((data) => {
        const { claim } = data as { claim: Claim };
        setClaim(claim);
      })
      .catch(console.error);
  }, [nonce]);

  return (
    <main className="relative">
      <section
        id="content"
        className="flex min-h-screen flex-col items-center justify-center"
      >
        {claim ? (
          <Verifier claim={claim} />
        ) : (
          <div
            className="radial-progress animate-spin"
            style={{ "--value": 70 } as React.CSSProperties}
          />
        )}
      </section>
    </main>
  );
}

export const getServerSideProps = (async ({ req, query }) => {
  const { nonce: nonceParam } = query;

  if (!nonceParam) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const nonce =
    typeof nonceParam === "string"
      ? nonceParam
      : nonceParam[nonceParam.length - 1];

  return {
    props: {
      nonce,
    },
  };
}) satisfies GetServerSideProps<Props>;
