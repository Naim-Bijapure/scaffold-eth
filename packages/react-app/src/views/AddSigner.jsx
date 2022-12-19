import { Button, Card, InputNumber, Typography } from "antd";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";

import { AddressInput } from "../components";
import MultisigWallet from "../contracts/MultisigWallet.json";
import { useLocalStorage } from "../hooks";

const { Title } = Typography;

function AddSigner({ signer, provider, mainnetProvider }) {
  const [to, setTo] = useLocalStorage("to");
  const [multisigWallet, setMultisigWallet] = useState();
  const [currentSignatureRequired, setCurrentSignatureRequired] = useState(0);
  const [signatureRequired, setSignatureRequired] = useState(undefined);
  const [currentOwnersCount, setCurrentOwnersCount] = useState(undefined);

  // const { action } = useParams();

  const loadWallet = async () => {
    console.log(`n-🔴 => AddSigner => provider`, provider);
    let walletAddress = await signer.getAddress();

    let MultiSigWallet = new ethers.Contract(walletAddress, MultisigWallet.abi, provider);
    setMultisigWallet(MultiSigWallet);

    let signatureRequired = await MultiSigWallet?.signaturesRequired();

    let ownersCount = await MultiSigWallet?.numberOfOwners();

    setCurrentSignatureRequired(signatureRequired.toString());
    setCurrentOwnersCount(ownersCount);
  };

  useEffect(() => {
    if (provider) {
      loadWallet();
    }
  }, [provider]);

  const createTranscaction = async () => {
    try {
      let methodName = "addSigner";

      const callData = multisigWallet?.interface?.encodeFunctionData(methodName, [to, signatureRequired]);

      const executeToAddress = multisigWallet.address;

      const txData = {
        to: executeToAddress,
        data: callData,
      };

      const tx = await signer.sendTransaction(txData);
      const rcpt = await tx.wait();
    } catch (error) {
      console.log("n-Error: ", error);
    }
  };

  return (
    <div>
      <Title>Add signer</Title>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card style={{ width: "50%" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ padding: "5px" }}>
              <AddressInput
                autoFocus
                ensProvider={mainnetProvider}
                placeholder={"Recepient address"}
                value={to}
                onChange={setTo}
              />
            </div>
            <div style={{ padding: "5px", alignSelf: "flex-start" }}>
              <span style={{ fontWeight: "bold" }}>New signature required:</span>
              <InputNumber
                style={{ margin: "5px" }}
                placeholder="Enter"
                value={signatureRequired}
                onChange={setSignatureRequired}
                min={0}
              />
            </div>
            <div style={{ padding: "2px", alignSelf: "flex-start" }}>
              <span style={{ color: "gray" }}>Current signers count : {currentSignatureRequired}</span>
            </div>

            <Button
              type="primary"
              style={{ padding: "5px", alignSelf: "center" }}
              onClick={() => createTranscaction()}
              disabled={
                signatureRequired <= +currentOwnersCount + 1 === false ? true : signatureRequired === 0 ? true : false
              }
            >
              Add signer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default AddSigner;
