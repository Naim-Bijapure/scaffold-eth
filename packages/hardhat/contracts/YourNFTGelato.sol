//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import "./YourNFT.sol";

contract YourNFTGelato is GelatoRelayContext {
    YourNFT ynt;
    address private _owner;

    constructor() {
        ynt = new YourNFT();
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Not owner");
        _;
    }

    function getYourNFT() public view returns (address) {
        return address(ynt);
    }

    function getYourNFTBalance(address user) public view returns (uint256) {
        return ynt.balanceOf(user);
    }

    function setAdminKeyAddress(address newAdminKey) public onlyOwner {
        // adminKey = newAdminKey;
        ynt.setAdminKeyAddress(newAdminKey);
    }

    function getAdminKeyAddress() public view returns (address) {
        return ynt.adminKey();
    }

    function whitelistMint(
        address user,
        uint256 chainId,
        bytes calldata signature,
        string memory tokenURI
    ) external onlyGelatoRelay {
        _transferRelayFee();
        ynt.whitelistMint(user, chainId, signature, tokenURI);
    }

    receive() external payable {}

    fallback() external payable {}
}
