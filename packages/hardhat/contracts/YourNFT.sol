//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";
// import "./Gelato/GelatoRelayContext.sol";

import "./Whitelisting.sol";

contract YourNFT is Whitelisting, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(bytes => bool) public isSignatureUsed;

    constructor() Whitelisting() ERC721("WhitelistToken", "WLT") {}

    function whitelistMint(
        address user,
        uint256 chainId,
        bytes calldata signature,
        string memory tokenURI
    ) external requiresWhitelist(user, chainId, signature) returns (uint256) {
        require(isSignatureUsed[signature] != true, "Signature already used");

        uint256 newItemId = _tokenIds.current();
        // _mint(msg.sender, newItemId);
        _mint(user, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tokenIds.increment();
        isSignatureUsed[signature] = true;
        return newItemId;
    }
}
