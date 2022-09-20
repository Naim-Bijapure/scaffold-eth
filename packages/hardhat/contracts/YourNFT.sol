//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {GelatoRelayContext} from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

import "./Whitelisting.sol";

contract YourNFT is Whitelisting, GelatoRelayContext, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(bytes => bool) public isSignatureUsed;

    constructor() Whitelisting() ERC721("WhitelistToken", "WLT") {}

    function _msgData()
        internal
        view
        virtual
        override(Context, GelatoRelayContext)
        returns (bytes calldata)
    {}

    function whitelistMint(
        // bytes32 hash,
        address user,
        uint256 chainId,
        bytes calldata signature,
        string memory tokenURI
    )
        external
        onlyGelatoRelay
        requiresWhitelist(user, chainId, signature)
        returns (uint256)
    {
        require(isSignatureUsed[signature] != true, "Signature already used");

        uint256 newItemId = _tokenIds.current();
        _transferRelayFee();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tokenIds.increment();
        isSignatureUsed[signature] = true;
        return newItemId;
    }
}
