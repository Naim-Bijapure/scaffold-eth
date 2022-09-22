import { useContractReader } from "eth-hooks";
import { ethers } from "ethers";
import React from "react";
import { GelatoRelaySDK } from "@gelatonetwork/relay-sdk";

import { Typography, Card, Button, List, Image, message } from "antd";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";

const { Title } = Typography;
const Sleep = async time =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      resolve(true);
    }, time),
  );

function Home({ baseURL, localChainId, userSigner, address, readContracts, writeContracts, tx }) {
  const [currentUserData, setCurrentUserData] = useState({ address: "", msgHash: "", msgSignature: "" });
  const [nfts, setNfts] = useState([1, 2, 3]);
  const [taskId, setTaskId] = useState("");
  const [mintStatus, setMintStatus] = useState("STOP");

  const onMint = async () => {
    try {
      setMintStatus("START");
      const FEE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      // let yourNFT = writeContracts["YourNFT"];
      let yourNFT = writeContracts["YourNFTGelato"];

      const { data: populateTxData } = await yourNFT?.populateTransaction.whitelistMint(
        address,
        localChainId,
        currentUserData.msgSignature,
        `https://cataas.com/cat/cute`,
      );

      // populate relay request
      const request = {
        chainId: localChainId,
        target: yourNFT?.address,
        data: populateTxData,
        feeToken: FEE_TOKEN,
      };
      // await Sleep(500);

      // // @ts-ignore
      const relayResponse = await GelatoRelaySDK.relayWithSyncFee(request);

      checkTaskStatus(relayResponse["taskId"]);
    } catch (error) {
      console.log("n-error: ", error);
      onMint();
    }
    // setTaskId(relayResponse["taskId"]);

    // let rcpt = await tx(
    //   yourNFT.whitelistMint(address, localChainId, currentUserData.msgSignature, `https://cataas.com/cat/cute`),
    // );

    // console.log("rcpt: ", rcpt);
    // checkTaskStatus(relayResponse["taskId"]);

    updateList();
  };

  const checkTaskStatus = async taskId => {
    try {
      setMintStatus("START");

      let statusResponse = await GelatoRelaySDK.getTaskStatus(taskId);
      if (statusResponse["taskState"] === "Cancelled") {
        setMintStatus(prev => "CANCLLED");
        return "";
      }

      if (statusResponse["taskState"] === "ExecSuccess") {
        setMintStatus(prev => "STOP");
        window.location.reload();
        return "";
      }

      if (statusResponse["taskState"] === "CheckPending" || statusResponse["taskState"] === "ExecPending") {
        await Sleep(5000);

        setMintStatus(prev => "CHECKING");
        checkTaskStatus(taskId);
      }
    } catch (error) {
      setMintStatus(prev => "error");
      await Sleep(2000);
      checkTaskStatus(taskId);
    }
  };

  const findAddress = async () => {
    let response = await axios.post(`${ baseURL }/findAddress`, { address });
    response = response.data;
    if (response["userData"] !== undefined) {
      setCurrentUserData({ ...response["userData"] });
    }
    updateList();
  };

  const updateList = async () => {
    if ("YourNFTGelato" in writeContracts) {
      let yourNFT = writeContracts["YourNFTGelato"];
      // let balance = await yourNFT.balanceOf(address);
      let balance = await yourNFT.getYourNFTBalance(address);
      console.log("n-balance: ", balance.toString());
      let tokenCount = +balance.toString();
      if (tokenCount !== 0) {
        setNfts([...Array(3 - tokenCount).keys()]);
      }
    }
  };

  useEffect(() => {
    if (address) {
      void findAddress();
    }
  }, [address, writeContracts]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Title level={2}>Cute cat's nft</Title>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {nfts.map(index => {
          return (
            <div key={index}>
              <Card
                title={index + 1}
                bordered={true}
                style={{
                  // width: "410%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    width={250}
                    height={250}
                    src={
                      index === 1
                        ? `https://cataas.com/cat/cute`
                        : index === 2
                          ? `https://cataas.com/cat`
                          : `https://cataas.com/cat/cute/says/hello`
                    }
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                  />
                  <Button
                    type="primary"
                    style={{ margin: 10 }}
                    onClick={onMint}
                    disabled={currentUserData["msgHash"] === "" || mintStatus === "CANCLLED"}
                    loading={mintStatus !== "STOP" && mintStatus !== "CANCLLED"}
                    danger={mintStatus === "CANCLLED"}
                  >
                    {mintStatus !== "CANCLLED" && <>mint a cutiee</>}
                    {mintStatus === "CANCLLED" && <>already minted</>}
                  </Button>
                </div>
              </Card>
            </div>
          );
        })}

        {nfts.length === 0 && (
          <Title level={3} type="warning">
            You minted all your NFT's
          </Title>
        )}
      </div>
    </div>
  );
}

export default Home;
