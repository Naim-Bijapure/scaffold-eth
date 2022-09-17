//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./Whitelisting.sol";

contract YourNFT is ERC721URIStorage, Whitelisting {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() Whitelisting() ERC721("WhitelistToken", "WLT") {}

    function whitelistMint(
        bytes32 hash,
        bytes calldata signature,
        string memory tokenURI
    ) public requiresWhitelist(hash, signature) returns (uint256) {
        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        _tokenIds.increment();
        return newItemId;
    }
}
