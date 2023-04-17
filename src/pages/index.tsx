import { createNonce } from "@/services/nonce";
import absoluteUrl from "next-absolute-url";
import { GetServerSideProps } from "next";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useReducer, useState } from "react";
import dayjs from "dayjs";
import { Claim, SignedClaim } from "@/services/types";
import { claimLifetime } from "@/services/constants";
import { isSigned } from "@/services/verify";
import { Verified } from "@/components/Verified";
// import { gates } from "@/services/config";

interface Props {
  endpoint: string;
  nonce: string;
}

interface ClaimReducerState {
  claim?: Claim | SignedClaim;
  claimSecondsRemaining?: number;
  last: SignedClaim[];
}

type ClaimReducerAction =
  | { type: "claimed"; claim: Claim }
  | { type: "passed"; claim: SignedClaim; passedAt: string }
  | { type: "invalid" }
  | { type: "expired" }
  | { type: "reset" };

function claimReducer(
  state: ClaimReducerState,
  action: ClaimReducerAction
): ClaimReducerState {
  switch (action.type) {
    case "claimed": {
      if (!state.claim || state.claim.nonce !== action.claim.nonce) {
        console.log(action.type, state);
        return {
          ...state,
          claim: action.claim,
          claimSecondsRemaining: secondsRemaining(action.claim.createdAt),
        };
      }

      return {
        ...state,
        claimSecondsRemaining: secondsRemaining(state.claim.createdAt),
      };
    }
    case "passed": {
      console.log(action.type, state);
      return { last: [action.claim, ...state.last].slice(0, 5) };
    }
    case "reset":
    case "expired":
    case "invalid": {
      if (state.claim) console.log(action.type, state);
      return state.claim ? { last: state.last } : state;
    }
  }

  function secondsRemaining(createdAt: string) {
    return Math.floor(
      Math.max(0, dayjs(createdAt).diff() + claimLifetime) / 1000
    );
  }
}

export default function Kiosk({
  endpoint: initialEndpoint,
  nonce: initialNonce,
}: Props) {
  const [nonce, setNonce] = useState(initialNonce);
  const [endpoint, setEndpoint] = useState(initialEndpoint);

  const [state, dispatch] = useReducer(claimReducer, { last: [] });

  useEffect(() => {
    const timer = setInterval(() => {
      fetch("/api/verify", { method: "POST", body: JSON.stringify({ nonce }) })
        .then((response) =>
          response.json().then((data) => ({
            data,
            ok: response.ok,
            status: response.status,
          }))
        )
        .then(({ data, ok }) => {
          if (!ok) return;

          const { claim, expired, passedAt } = data as {
            claim?: Claim | SignedClaim;
            expired?: boolean;
            passedAt?: string;
          };

          if (claim) {
            if (expired) {
              dispatch({ type: "expired" });
              handleGenerateNewCode();
            } else {
              if (isSigned(claim)) {
                if (passedAt) {
                  dispatch({ type: "passed", claim, passedAt });
                  handleGenerateNewCode();
                } else {
                  dispatch({ type: "invalid" });
                  handleGenerateNewCode();
                }
              } else {
                dispatch({ type: "claimed", claim });
              }
            }
          } else {
            dispatch({ type: "reset" });
          }
        })
        .catch((error) => {
          console.log("verify error", error);
        });
    }, 1000);

    return () => clearInterval(timer);
  }, [nonce]);

  return (
    <main className="flex flex-col h-screen w-screen">
      <section id="header" className="w-full h-16 bg-stone-900">
        <div className="navbar">
          <div className="navbar-start" />
          <div className="navbar-center">
            {state.claimSecondsRemaining != null ? (
              <div className="flex items-center gap-2">
                <p>Claimed for</p>
                <span className="countdown font-mono text-4xl">
                  <span
                    style={
                      {
                        "--value": state.claimSecondsRemaining,
                      } as React.CSSProperties
                    }
                  />
                </span>
                sec
              </div>
            ) : (
              <p>Unclaimed</p>
            )}
          </div>
          <div className="navbar-end" />
        </div>
      </section>
      <section
        id="content"
        className="flex-1 flex flex-col items-center justify-center h-full"
      >
        <div className={`p-4 min-w-[425px] ${state.claim ? "bg-success" : ""}`}>
          <div className="font-mono text-center text-secondary p-2">
            <a href={endpoint}>{nonce}</a>
          </div>
          <QRCodeSVG
            className={state.claimSecondsRemaining != null ? "blur-md" : ""}
            {...({ size: null } as any)}
            value={endpoint}
            onClick={handleGenerateNewCode}
          />
        </div>
      </section>
      <section id="footer" className="w-full h-72 bg-stone-900 overflow-auto">
        <div className="navbar h-full">
          <div className="navbar-start" />
          <div className="navbar-center">
            <div className="flex gap-2">
              {state.last.map((claim) => (
                <Verified key={claim.nonce} claim={claim} />
              ))}
            </div>
          </div>
          <div className="navbar-end" />
        </div>
      </section>
    </main>
  );

  function handleGenerateNewCode() {
    const nonce = createNonce();
    const { origin } = window.location;
    const endpoint = createEndpoint(origin, nonce);

    setNonce(nonce);
    setEndpoint(endpoint);
    dispatch({ type: "reset" });
  }
}

export const getServerSideProps = (({ req, query }) => {
  const nonce = createNonce();
  const { origin } = absoluteUrl(req, "localhost:3000");
  const endpoint = createEndpoint(origin, nonce);

  return Promise.resolve({
    props: { endpoint, nonce },
  });
}) satisfies GetServerSideProps<Props>;

function createEndpoint(origin: string, nonce: string) {
  return `${origin}/verify?nonce=${nonce}`;
}
