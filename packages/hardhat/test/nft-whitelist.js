const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("NFT WHITELIST", function () {
  let yourNFT;
  let msgHash;
  let signature;
  const signer1 = new ethers.Wallet(
    "0x85871d74bfacc6c3210979a33272ffe11faab61fa797efc644fa84da4aac8133"
  );

  const signer2 = new ethers.Wallet(
    "0x023e625cadd31204d6bee5360a31a6c035b6f28504edde3caa7f222a64b1aa89"
  );

  const signer3 = new ethers.Wallet(
    "0x0fb71af06b02814b3a06bc9e71587a2ad3e1ec21818ae6fd19ce6759df03eb3b"
  );

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });

  describe("Deploy YourNft  contract", function () {
    it("Should deploy YourContract", async function () {
      //       console.log("ethers.provider: ", await ethers.provider.lookupAddress());

      const [user1, user2] = await ethers.getSigners();
      console.log("user1: ", user1.address);

      const YourNFT = await ethers.getContractFactory("YourNFT", {
        signer: user1,
      });
      yourNFT = await YourNFT.deploy();
      console.log("yourNFT: ", yourNFT.address);
    });

    it("Set Whitelist sign key", async function () {
      const tx = await yourNFT.setAdminKeyAddress(signer1.address);
      const rcpt = await tx.wait();
      //       console.log("rcpt: ", rcpt);
    });

    it("create whitelist sig and hash ", async function () {
      const msg = signer2.address;
      msgHash = ethers.utils.id(msg);
      console.log("msgHash: ", msgHash);
      // Sign the hashed address
      const messageBytes = ethers.utils.arrayify(msgHash);
      signature = await signer1.signMessage(messageBytes);
      console.log("Signature: ", signature);
      // expect(signature).to.be.string();
    });

    it("mint an nft with allowded address ", async function () {
      await expect(
        yourNFT.whitelistMint(
          msgHash,
          signature,
          "ipfs://bafybeiaqofrinid75krvga6c2alksixzmhuddx3zxgwvmyhh7vsyjbv6tm"
        )
      ).not.to.be.reverted;
    });

    it("mint an nft with not  allowded address ", async function () {
      const msg = signer3.address;
      msgHash = ethers.utils.id(msg);
      console.log("msgHash: ", msgHash);
      // Sign the hashed address
      const messageBytes = ethers.utils.arrayify(msgHash);
      signature = await signer2.signMessage(messageBytes);
      console.log("Signature: ", signature);

      await expect(
        yourNFT.whitelistMint(
          msgHash,
          signature,
          "ipfs://bafybeiaqofrinid75krvga6c2alksixzmhuddx3zxgwvmyhh7vsyjbv6tm"
        )
      ).to.be.revertedWith("Invalid Signature");
    });
  });
});
