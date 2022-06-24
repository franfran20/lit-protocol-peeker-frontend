import Head from "next/head";
import styles from "../styles/Home.module.css";
import LitJsSdk, { LitNodeClient } from "lit-js-sdk";
import { WebBundlr } from "@bundlr-network/client";
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useRef, useState } from "react";
import { ABI } from "../constants/abi";
import { evmContractConditions } from "../constants/evmContractConditions";
import { hexStringToArrayBuffer } from "../utils/utils";

export default function Home() {
  const bundlrRef = useRef();
  const { Moralis, isWeb3Enabled, enableWeb3 } = useMoralis();
  const [decryptedMessage, setDecryptedMessage] = useState();
  const { runContractFunction } = useWeb3Contract({
    abi: ABI,
    contractAddress: "0xB930bE2810c66d5A4f400217De35b81D297f3ED6",
    functionName: "allowMeToPeek",
  });
  const chain = "mumbai";
  let encryptedKey;

  //connect buttton for initilaizing lit and bundlr
  async function connect() {
    const provider = await enableWeb3();
    await provider._ready();
    const client = new LitJsSdk.LitNodeClient();
    await client.connect();
    window.LitNodeClient = client;
  }

  //encrypt a message and store it on arweave
  async function encrypt(msg) {
    await clearSignature();
    let authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
    console.log("authsig:", authSig);

    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(msg);
    const encryptedSymmetricKey = await window.LitNodeClient.saveEncryptionKey({
      evmContractConditions,
      symmetricKey,
      authSig,
      chain,
    });
    encryptedKey = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16");
    //packaging data to be sent to bundlr
    const packagedData = JSON.stringify({
      encryptedString: Buffer.from(
        await encryptedString.arrayBuffer()
      ).toString("hex"),
      encryptedSymmetricKey: encryptedKey,
      evmContractConditions,
    });

    const tags = [
      { name: "Content-Type", value: "application/json; charset=utf-8" },
    ];
    const tx = bundlrRef.current.createTransaction(packagedData, {
      tags: tags,
    });
    await tx.sign();
    const id = tx.id;
    await tx.upload();
    console.log(`https://arweave.net/${id}`);

    const returnObj = {
      encryptedString: Buffer.from(
        await encryptedString.arrayBuffer()
      ).toString("hex"),
      encryptedSymmetricKey: LitJsSdk.uint8arrayToString(
        encryptedSymmetricKey,
        "base16"
      ),
    };
    console.log(returnObj);
    setEncryptedMessage(returnObj.encryptedString);
    setEncryptedMessageLocation(`https://arweave.net/${id}`);
  }

  //decrypt message
  async function decrypt() {
    const symmetricKey = await getEncryptedKey(
      "https://arweave.net/veLOv2u_b85V2onlHx2jH7uxFr-XGPWM3fSH1hDe3jI"
    );
    const decryptedString = await LitJsSdk.decryptString(
      new Blob([
        hexStringToArrayBuffer(
          "b588a4da632d1afc720947174aac3ac35f8074fb1c60c37c5251125f1d65c442e099185c302df39bafdfed002fb2ed6e83848aa66ef2aa32ce167fab89806f3cd1c217c4cd24890a25d8eab8386dd357cc201268d4ff0565d0c76449323838fa309dbdabe6579b733108d8a31df4f285b9e30718380cebd69b0abe057b7af1e782301cf7ccf45172e495655569898957"
        ),
      ]),
      symmetricKey
    );
    console.log("Decrypted String", decryptedString);
    setDecryptedMessage(decryptedString);
  }

  //function to get encrypted key used in decrypt
  async function getEncryptedKey() {
    await clearSignature();
    const data = await fetch(
      "https://arweave.net/veLOv2u_b85V2onlHx2jH7uxFr-XGPWM3fSH1hDe3jI"
    );
    // const JsonData = JSON.parse(data);
    const dataOnArweave = JSON.parse(await data.text());

    const evmContractConditions = dataOnArweave.evmContractConditions;
    console.log(evmContractConditions);
    console.log("encrypted key", dataOnArweave.encryptedSymmetricKey);

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });

    const encryptedSymmetricKey = dataOnArweave.encryptedSymmetricKey;
    // symmetric key
    const symmetricKey = await window.LitNodeClient.getEncryptionKey({
      evmContractConditions,
      toDecrypt: encryptedSymmetricKey,
      chain,
      authSig,
    });

    return symmetricKey;
  }

  //clear signature form local storage for lit
  async function clearSignature() {
    await LitJsSdk.disconnectWeb3();
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Franfran20</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <nav className="navBar">
        <h1>Peekers!</h1>
        <div>
          {isWeb3Enabled ? (
            <p className="connected">Connected</p>
          ) : (
            <button onClick={connect} className="connectButton">
              Connect
            </button>
          )}
        </div>
      </nav>

      <div className="container">
        <div className="text">
          <p>
            This just shows the basic fundamental ability of LIT protocol and
            why its truly lit! Below is an encrypted Text that only users who
            are allowed to peek via our peek smart contract can decrypt(An on
            chain condition!). So connect your wallet fren!
          </p>
          <p>
            Make sure you are allowed to peek broo! Else first allow yourself to
            peek then decrypt
          </p>
        </div>
        <div className="buttons">
          <button
            className="allowPeek"
            onClick={async () =>
              await runContractFunction({
                onSuccess: async (tx) => await tx.wait(2),
              })
            }
          >
            Allow Me To Peek
          </button>
          <button className="decrypt" onClick={async () => await decrypt()}>
            Peek/Decrypt Message
          </button>
        </div>

        <div className="message">
          <p>Message:</p>
          {decryptedMessage ? (
            <p className="decryptedMessage">{decryptedMessage}</p>
          ) : (
            <span className="encrypted text">
              015ec9933e24d0ce03c5dcce80459565a507c24171e8481e76
              <br />
              3a06b3de4323c654519d9a07ae6f06d7f1e33daeb08f339
              <br />
              1bc9b778cc5f6e084db127a02cc0c35174059c553f8875ca
              <br />
              0c4d62c8ce2dd0f60daad5a132786a692ee21cecb0d276c38
              <br />
              861fda595af813ad7926e982fc84161c925140acc5be576150eb6596b95820
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
