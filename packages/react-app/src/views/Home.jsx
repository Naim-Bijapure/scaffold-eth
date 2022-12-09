import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button, Typography, Card } from "antd";
import { AddressInput, EtherInput } from "../components";
import { useLocalStorage } from "../hooks";

const { Title } = Typography;

function Home({ signer, provider, mainnetProvider, price }) {
  const [to, setTo] = useLocalStorage("to");
  const [amount, setAmount] = useState("0");

  const sendEth = async () => {
    const txData = {
      to,
      value: ethers.utils.parseEther("" + parseFloat(amount).toFixed(12)),
    };

    const tx = await signer.sendTransaction(txData);
    const rcpt = await tx.wait();
    console.log(`sendEth => rcpt`, rcpt);
  };

  return (
    <div>
      <Title>Send Eth</Title>

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
            <EtherInput price={price} mode="USD" value={amount} onChange={setAmount} provider={provider} />
          </div>

          <Button type="primary" onClick={sendEth}>
            Send Eth
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default Home;
