import { Button, Card, Typography, InputNumber, Input } from "antd";
import axios from "axios";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { AddressInput, EtherInput } from "../components";
import MultisigWallet from "../contracts/MultisigWallet.json";
import { useLocalStorage } from "../hooks";

const { Title } = Typography;

export const Sleep = time =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(true);
    }, time),
  );
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function CustomCall({ signer, provider, mainnetProvider, price }) {
  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useState(undefined);
  const [multisigWallet, setMultisigWallet] = useState();
  const [customCallData, setCustomCallData] = useState();

  const loadWallet = async () => {
    let walletAddress = await signer.getAddress();

    let MultiSigWallet = new ethers.Contract(walletAddress, MultisigWallet.abi, provider);
    setMultisigWallet(MultiSigWallet);
  };

  useEffect(() => {
    if (provider) {
      loadWallet();
    }
  }, [provider]);

  const createTranscaction = async () => {
    try {
      const executeToAddress = multisigWallet.address;

      const txData = {
        to: executeToAddress,
        data: customCallData,
      };

      const tx = await signer.sendTransaction(txData);
      const rcpt = await tx.wait();
    } catch (error) {
      console.log("n-Error: ", error);
    }
  };

  return (
    <div>
      <Title>Custom Call</Title>

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
            <div style={{ padding: "5px" }}>
              <Input
                style={{ margin: "5px" }}
                placeholder="Enter custom call data"
                value={customCallData}
                onChange={event => setCustomCallData(event.target.value)}
              />
            </div>

            <div style={{ padding: "5px" }}>
              <div style={{ padding: "5px" }}>
                <EtherInput mode="USD" price={price} value={amount} onChange={setAmount} provider={provider} />
              </div>
            </div>

            <Button type="primary" style={{ padding: "5px", alignSelf: "center" }} onClick={() => createTranscaction()}>
              Submit
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CustomCall;
