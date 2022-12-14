import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import { useAccount, useSignMessage } from "wagmi";
import { useState } from "react";
import { verifyMessage, arrayify } from "ethers/lib/utils";
import canonicalize from "canonicalize";

const time = Date.now();

const Home: NextPage = () => {
  function internalBase64Encode(input: string) {
    return input.replaceAll("+", ".").replaceAll("/", "_").replaceAll("=", "-");
  }

  const [authFail, setAuthFail] = useState(false);
  const [redirectLink, setRedirectLink] = useState("");

  console.log(time);
  const payload = canonicalize({
    method: "generateToken",
    params: {
      timestamp: time,
    },
  });
  console.log(payload);

  const { signMessage } = useSignMessage({
    message: payload,
    onSuccess(data, variables) {
      const address = verifyMessage(variables.message, data);
      console.log(`message: ${variables.message}`);
      console.log(`sign address: ${address}`);
      console.log(`signed payload: ${data}`);
      const signedPayload = data;

      const signature = Buffer.from(arrayify(signedPayload)).toString("base64");

      const selfSignedToken = `eip191:${signature}`;
      console.log(selfSignedToken);
      (async function () {
        const response = await fetch("/api/auth", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${selfSignedToken}`,
          },
          body: JSON.stringify({ payload, selfSignedToken }),
        });

        if (!response.ok) setAuthFail(true);
        else {
          const data = await response.json();
          console.log(JSON.stringify(data));

          if (typeof window !== "undefined" && data.secret) {
            const link = `https://phrasetown.com/auth?k=${internalBase64Encode(
              data.secret
            )}`;
            setRedirectLink(link);
            // await new Promise((r) => setTimeout(r, 5000));
            window.location.href = link;
          }
        }
      })();
    },
  });

  useAccount({
    onConnect({ address, connector, isReconnected }) {
      signMessage();
    },
  });
  if (authFail) {
    return (
      <div className="max-w-md mx-auto text-xl py-5 flex flex-col space-y-4 px-1">
        <p className="font-[900]">Authentication failed!</p>
        <span>
          Are you signing with the seed phrase that Farcaster gave you? This
          connector only works if you sign with your Farcaster address.
        </span>

        <span>Please refresh and try again :)</span>
      </div>
    );
  } else {
    return (
      <div className="max-w-md mx-auto text-xl py-5 flex flex-col space-y-4 px-1">
        <p className="font-[900]">Phrasetown Connect</p>
        <span>
          {" "}
          Connect your wallet to use Phrasetown, a Farcaster web client.
        </span>
        <span> Steps:</span>
        <span>
          {" "}
          1. Coinbase Wallet, Rainbow Wallet, Trust Wallet, pick any of these
          mobile wallets and load your Farcaster seed phrase in it (the seed
          phrase Farcaster provided when registering)
        </span>
        <span>
          {" "}
          2. (Again, you have to use the seed Farcaster gave you. This connector
          will not work if you sign with your usual non-Farcaster seed phrase!)
        </span>
        <span> 3. Connect the wallet, scan QR</span>
        <span>
          {" "}
          4. A message will appear on your screen, click sign (it is not an
          onchain transaction, signature is required to create an authentication
          key, which is stored in your browser and does not get sent to any
          server)
        </span>
        <span>
          {" "}
          5. Magic happens on the background, and you will be redirected to
          Phrasetown
        </span>
        <ConnectButton />
        <a
          href="https://phrasetown.com"
          className="text-base text-neutral-600 hover:text-neutral-200 hover:underline transition"
        >
          Back to client
        </a>
        <a
          href="https://github.com/vinliao/phrasetown-connect"
          className="text-base text-neutral-600 hover:text-neutral-200 hover:underline transition"
        >
          https://github.com/vinliao/phrasetown-connect
        </a>
        <span className="text-base text-neutral-600">
          P.S. Experimental feature, bugs are likely. If you encounter problems
          when using Phrasetown, email me at vincent@pixelhack.xyz or ping me on
          Farcaster @pixel and I will help you sort it out. I recommend using
          burner Farcaster account instead of your main account to test this out
          first.
        </span>
      </div>
    );
  }
};

export default Home;
