//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Whitelisting is Ownable {
    using ECDSA for bytes32;

    address public adminKey = address(0);

    constructor() {}

    function setAdminKeyAddress(address newAdminKey) public onlyOwner {
        adminKey = newAdminKey;
    }

    modifier requiresWhitelist(bytes32 hash, bytes calldata signature) {
        require(adminKey != address(0), "whitelist not enabled");

        bytes32 messageDigest = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );

        address recoveredAddress = ECDSA.recover(messageDigest, signature);

        require(recoveredAddress == adminKey, "Invalid Signature");
        _;
    }
}
