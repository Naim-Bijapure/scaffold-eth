import { useContractReader } from "eth-hooks";
import { Typography, Card, Button, List } from "antd";

import { ethers } from "ethers";
import React from "react";
import { Link } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import AddressInput from "../components/AddressInput";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { Address } from "../components";

const { Text, Title } = Typography;

function Admin({ baseURL, userSigner, address, readContracts, mainnetProvider }) {
  const adminKey = useContractReader(readContracts, "YourNFT", "adminKey");
  const [wishListAddress, setWishListAddress] = useState("");
  const [wishList, setWishList] = useState([]);
  const [fetchListToggle, setFetchListToggle] = useState(false);
  const [isAlreadyExists, setIsAlreadyExists] = useState(false);
  const [isAdmin, setIsAdmin] = useState(undefined);

  const getWishlist = async () => {
    let responseWishlist = await axios.get(`${baseURL}/wishList`);
    responseWishlist = responseWishlist.data;
    console.log("responseWishlist: ", responseWishlist);
    setWishList([...responseWishlist["allowedList"]]);
  };

  const onAddWishList = async () => {
    console.log("wishListAddress: ", wishListAddress);
    let msgHash = ethers.utils.id(wishListAddress);
    console.log("msgHash: ", msgHash);
    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(msgHash);

    let msgSignature = await userSigner.signMessage(messageBytes);
    console.log("msgSignature: ", msgSignature);
    let reqData = { address: wishListAddress, msgHash, msgSignature };
    let response = await axios.post(`${baseURL}/addToWishList`, reqData);
    response = response.data;
    console.log("response: ", response);

    if (response["status"] === true) {
      setWishListAddress("");
      setFetchListToggle(!fetchListToggle);
      setIsAlreadyExists(false);
    }

    if (response["status"] === false) {
      setWishListAddress("");
      setIsAlreadyExists(true);
    }
  };

  const onRemoveAddress = async address => {
    let reqData = { address };
    console.log("reqData: ", reqData);
    let response = await axios.post(`${baseURL}/removeFromWishList`, reqData);
    response = response.data;
    console.log("response: ", response);
    setFetchListToggle(!fetchListToggle);
  };

  useEffect(() => {
    void getWishlist();
  }, [fetchListToggle]);

  useEffect(() => {
    if (adminKey) {
      setIsAdmin(true);
    }

    if (adminKey !== address || adminKey === undefined) {
      setIsAdmin(false);
    }
  }, [adminKey, address]);

  return (
    <div>
      {isAdmin === false && (
        <div style={{ marginTop: 100 }}>
          <Title level={5} type="warning">
            only admin can add wish list addresses !!
          </Title>
        </div>
      )}

      {adminKey && adminKey === address && (
        <div
          style={{
            marginTop: 30,
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Card title="Add an address to nft whistlis" bordered={true}>
            <AddressInput
              placeholder={"Enter whitelist address"}
              onChange={setWishListAddress}
              value={wishListAddress}
              ensProvider={mainnetProvider}
            />
            <Button type="primary" style={{ margin: 10 }} onClick={onAddWishList} disabled={wishListAddress === ""}>
              Add
            </Button>
          </Card>

          <Text type="warning">{isAlreadyExists && <>Address already added</>}</Text>

          <div style={{ width: "80%" }}>
            <List
              itemLayout="horizontal"
              header={<h1>Wish list addresses</h1>}
              style={{ border: "" }}
              dataSource={wishList}
              renderItem={(item, index) => (
                <List.Item
                  //   actions={[
                  //     <Button type="primary" danger>
                  //       Delete
                  //     </Button>,
                  //   ]}
                  key={index}
                >
                  <List.Item.Meta
                    key={index}
                    title={[
                      <span style={{ margin: 20 }}>{index + 1}</span>,
                      <span style={{ scale: 1, fontSize: 10 }}>
                        <Address scale={5} address={item.address} />
                      </span>,
                      <Button danger style={{ marginLeft: 10 }} onClick={() => onRemoveAddress(item.address)}>
                        <DeleteOutlined type="primary" />
                      </Button>,
                    ]}
                  />
                </List.Item>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
