// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract LandRegistry is ERC721 {
    struct Ownership {
        address owner;
        uint256 share; // Ownership share as a percentage (scaled by 10^4 for precision)
    }

    enum ProposalType { Split, Merge }

    struct Proposal {
        uint256 plotId;              // Plot ID for action
        address[] approvers;         // List of owners who approved
        mapping(address => bool) approvals; // Tracks approvals
        ProposalType proposalType;   // Type of proposal (e.g., Split, Merge)
        bool executed;               // Whether the action is executed
        bytes proposalData;          // Encoded data specific to the proposal type
    }

    struct SplitProposalData {
        PlotDetails split1;      // Split data for the action
        PlotDetails split2;      // Split data for the action
    }

    struct PlotDetails {
        address[] owners;
        uint256[] shares;
        uint256 totalShares;
        string ipfsHash;
    }

    struct Plot {
        uint256 id; // Unique governmental ID
        Ownership[] owners; // List of owners and their shares
        string ipfsHash; // Hash of geospatial data stored on IPFS
        uint256 totalShares; // Total shares available for the land (e.g., 100 shares)
    }

    mapping(uint256 => Plot) public plots; // Token ID => Owners and shares
    uint256 public plotCount;

    mapping(uint256 => Proposal) public proposals; //  Proposal ID => Proposal

    uint256 public proposalCount;

    constructor() ERC721("TrustEstate", "TE") {}

    // Mint a new plot of land with initial ownership
    function mintPlot(
        address[] memory owners,
        uint256[] memory shares,
        uint256 totalShares,
        string memory ipfsHash
    ) public {
        PlotDetails memory plot;
        plot.owners = owners;
        plot.shares = shares;
        plot.totalShares = totalShares;
        plot.ipfsHash = ipfsHash;

        _mintPlot(plot);
    }

    // Create a proposal for splitting
    function createSplitProposal(
        uint256 plotId,
        PlotDetails memory split1,
        PlotDetails memory split2
    ) external {
        require(_isOwner(plotId, msg.sender), "Not an owner");

        SplitProposalData memory splitData = SplitProposalData({ split1: split1, split2: split2 });
        bytes memory encodedData = abi.encode(splitData);

        _createProposal(plotId, ProposalType.Split, encodedData);
    }


    function _createProposal(uint256 plotId, ProposalType proposalType, bytes memory proposalData) internal {
        require(_isOwner(plotId, msg.sender), "Not an owner");

        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.plotId = plotId;
        proposal.proposalType = proposalType;
        proposal.proposalData = proposalData;
        proposal.executed = false;
    }

    function approveProposal(uint256 proposalId) internal {
        Proposal storage proposal = proposals[proposalId];

        require(!proposal.executed, "Proposal already executed");
        require(_isOwner(proposal.plotId, msg.sender), "Not an owner");
        require(!proposal.approvals[msg.sender], "Already approved");

        proposal.approvals[msg.sender] = true;
        proposal.approvers.push(msg.sender);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");

        uint256 sumOfOwnerShares = 0;
        for (uint256 i = 0; i < proposal.approvers.length; i++) {
            address approver = proposal.approvers[i];
            uint256 share = _getShare(proposal.plotId, approver);
            sumOfOwnerShares += share;
        }

        require(sumOfOwnerShares == plots[proposal.plotId].totalShares, "Not all owners have approved");

        if (proposal.proposalType == ProposalType.Split) {
            SplitProposalData memory splitData = abi.decode(proposal.proposalData, (SplitProposalData));
            _executeProposalSplit(proposal.plotId, splitData);
        } else if (proposal.proposalType == ProposalType.Merge) {
            revert("Not implemented");
        } else {
            revert("Invalid proposal type");
        }
        proposal.executed = true;
    }

    // Execute a proposal
    function _executeProposalSplit(uint256 plotId, SplitProposalData memory splitData) internal {
        _mintPlot(splitData.split1);
        _mintPlot(splitData.split2);

        _burn(plotId);
        delete plots[plotId];
    }


    // Internal helper to mint a new plot
    function _mintPlot(PlotDetails memory plotDetails) internal {
        require(plotDetails.owners.length == plotDetails.shares.length, "Mismatched owners and shares");

        uint256 sumOfOwnerShares = 0;
        for (uint256 i = 0; i < plotDetails.shares.length; i++) {
            sumOfOwnerShares += plotDetails.shares[i];
        }
        require(sumOfOwnerShares == plotDetails.totalShares, "Total shares must match sum of owner shares");
        
        plotCount++;
        _mint(msg.sender, plotCount);

        Plot storage newPlot = plots[plotCount];
        newPlot.id = plotCount;
        newPlot.ipfsHash = plotDetails.ipfsHash;
        newPlot.totalShares = plotDetails.totalShares;

        for (uint256 i = 0; i < plotDetails.owners.length; i++) {
            newPlot.owners.push(Ownership({ owner: plotDetails.owners[i], share: plotDetails.shares[i] }));
        }
    }

    // Internal helper to check ownership
    function _isOwner(uint256 tokenId, address account) public view returns (bool) {
        Ownership[] memory owners = plots[tokenId].owners;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i].owner == account) {
                return true;
            }
        }
        return false;
    }

    // Internal helper to get share of an owner
    function _getShare(uint256 tokenId, address account) internal view returns (uint256) {
        Ownership[] memory owners = plots[tokenId].owners;
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i].owner == account) {
                return owners[i].share;
            }
        }
        return 0;
    }
}
