import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Typography, Card } from "antd";
import axios from "axios";
import { useParams } from "react-router-dom";

import { AddressInput, EtherInput } from "../components";
import { useLocalStorage } from "../hooks";
import MultisigWallet from "../contracts/MultisigWallet.json";

const { Title } = Typography;

export const Sleep = time =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(true);
    }, time),
  );
let BACKEND_URL = "http://localhost:49899/";

function AddSigner({ contractName, signer, provider, mainnetProvider, readContracts }) {
  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useState("0");
  const [multisigWallet, setMultisigWallet] = useState();

  const { walletAddress, nonce } = useParams();
  console.log(`n-🔴 => AddSigner => walletAddress, nonce`, walletAddress, nonce);

  const contractAddress = "0xbA61FFB5378D34aCD509205Fd032dFEBEc598975";
  const customNonce = 0;

  const loadWallet = async () => {
    let MultiSigWallet = new ethers.Contract(contractAddress, MultisigWallet.abi, provider);
    setMultisigWallet(MultiSigWallet);
  };

  useEffect(() => {
    if (provider) {
      loadWallet();
    }
  }, [provider]);

  const addsigner = async () => {
    try {
      console.log(`n-🔴 => addsigner => addsigner`);

      const callData = multisigWallet?.interface?.encodeFunctionData("addSigner", [to, 1]);

      const executeToAddress = multisigWallet.address;
      const newHash = await multisigWallet.getTransactionHash(
        customNonce,
        executeToAddress,
        ethers.utils.parseEther("" + parseFloat(amount).toFixed(12)),
        callData,
      );

      // const signature = await signer?.signMessage(ethers.utils.arrayify(newHash));

      // const recover = await multisigWallet.recover(newHash, signature);

      // const isOwner = await multisigWallet.isOwner(recover);
      const res = await axios.post(BACKEND_URL, {
        chainId: provider._network.chainId,
        address: multisigWallet?.address,
        nonce: customNonce,
        to: executeToAddress,
        amount,
        data: callData,
        hash: newHash,
        signatures: [],
        signers: [],
      });
      window.open("http://localhost:3000/pool", "_blank");
    } catch (error) {
      console.log("n-Error: ", error);
    }
  };

  return (
    <div>
      <Title>Add Signer</Title>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <Card style={{ width: "50%" }}>
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
            {/* <EtherInput price={price} mode="USD" value={amount} onChange={setAmount} provider={provider} /> */}
          </div>

          <Button type="primary" onClick={addsigner}>
            Add signer
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default AddSigner;
