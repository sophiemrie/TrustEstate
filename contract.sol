// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LandToken is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Land {
        uint256 tokenId; // Token ID representing the land NFT
        string ipfsHash; // Hash of geospatial data stored on IPFS
        uint256 totalShares; // Total shares available for the land (e.g., 100 shares)
    }

    // Mapping from token ID to Land details
    mapping(uint256 => Land) private _lands;

    constructor(address initialOwner) ERC1155("https://example.com/api/item/{id}.json") Ownable(initialOwner) {
        transferOwnership(initialOwner);
    }

    // Mint a new land token, representing a new plot of land
    function mintLand(address to, string memory ipfsHash, uint256 totalShares) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Create the Land struct
        _lands[newTokenId] = Land({
            tokenId: newTokenId,
            ipfsHash: ipfsHash,
            totalShares: totalShares
        });

        // Mint the NFT representing the land
        _mint(to, newTokenId, 1, "");

        // Mint the fungible tokens representing ownership shares of the land
        _mint(to, newTokenId + 1, totalShares, "");

        return newTokenId;
    }

    // Fetch details about a specific plot of land
    function getLandDetails(uint256 tokenId) public view returns (string memory ipfsHash, uint256 totalShares) {
        require(_lands[tokenId].tokenId != 0, "LandToken: Query for nonexistent token");
        Land memory land = _lands[tokenId];
        return (land.ipfsHash, land.totalShares);
    }

    
    // Transfer ownership shares of the land
    function transferOwnershipShare(address from, address to, uint256 tokenId, uint256 amount) public {
        require(_lands[tokenId].tokenId != 0, "LandToken: Transfer for nonexistent token");
        _safeTransferFrom(from, to, tokenId + 1, amount, "");
    }
}
