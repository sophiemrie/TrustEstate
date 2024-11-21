// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TrustEstate is ERC721 {
    struct Ownership {
        address owner;
        uint256 share; // Ownership share as a percentage (scaled by 10^4 for precision)
    }

    enum ProposalType { Split, Merge, Transfer }

    struct Proposal {
        uint256 plotId;              // Plot ID for action
        address[] hasToApprove;         // List of people who have to approve
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

    struct MergeProposalData {
        PlotDetails merge;  // Merged plot data
        uint256 plotId1;
        uint256 plotId2;
    }

    struct TransferProposalData {
        PlotDetails transfer;
    }

    struct PlotDetails {
        address[] owners;
        uint256[] shares;
        uint256 totalShares;
        string ipfsHash;
        bool allowIndividualTransfer;
    }

    struct Plot {
        uint256 id; // Unique governmental ID
        Ownership[] owners; // List of owners and their shares
        string ipfsHash; // Hash of geospatial data stored on IPFS
        uint256 totalShares; // Total shares available for the land (e.g., 100 shares)
        bool allowIndividualTransfer; // Whether or not the land can be sold individually
    }

    mapping(uint256 => Plot) public plots; // Token ID => Owners and shares
    uint256 public plotCount;

    mapping(uint256 => Proposal) public proposals; //  Proposal ID => Proposal

    uint256 public proposalCount;

    event ProposalCreated(uint256 plotId, uint256 proposalId);
    event ProposalApproved(uint256 plotId, uint256 proposalId, address approver);
    event ProposalExecuted(uint256 plotId, uint256 proposalId);

    constructor() ERC721("TrustEstate", "TE") {}

    function getPlot(uint256 id) external view returns (Plot memory) {
        return plots[id];
    }

    // Mint a new plot of land with initial ownership
    function mintPlot(
        address[] memory owners,
        uint256[] memory shares,
        uint256 totalShares,
        string memory ipfsHash,
        bool allowIndividualTransfer
    ) public {
        PlotDetails memory plot;
        plot.owners = owners;
        plot.shares = shares;
        plot.totalShares = totalShares;
        plot.ipfsHash = ipfsHash;
        plot.allowIndividualTransfer = allowIndividualTransfer;

        _mintPlot(plot);
    }

    function transferOwnershipShare(address from, address to, uint256 plotId, uint256 amount) public {
        require(plots[plotId].id != 0, "LandToken: Transfer for nonexistent token");
        require(_isOwner(plotId, from), "Not an owner");
        uint256 shareOfCurrentOwner = _getShare(plotId, from);
        require(shareOfCurrentOwner > amount, "Not enough shares");
        require(plots[plotId].allowIndividualTransfer, "Plot is not allowed to be individually transferred");

        uint256 ownerIndex = 0;
        for (uint256 i = 0; i < plots[plotId].owners.length; i++) {
            if (plots[plotId].owners[i].owner == from) {
                ownerIndex = i;
            }
        }

        if (shareOfCurrentOwner == amount) {
            plots[plotId].owners[ownerIndex].owner = to;
        } else {
            plots[plotId].owners.push(Ownership({ owner: to, share: amount }));
            plots[plotId].owners[ownerIndex].share -= amount;
        }
    }

    function createSplitProposal(
        uint256 plotId,
        PlotDetails memory split1,
        PlotDetails memory split2
    ) external {
        require(_isOwner(plotId, msg.sender), "Not an owner");

        SplitProposalData memory splitData = SplitProposalData({ split1: split1, split2: split2 });
        bytes memory encodedData = abi.encode(splitData);

        address[] memory hasToApprove = _getOwners(plotId);

        _createProposal(plotId, ProposalType.Split, hasToApprove, encodedData);
    }

    function createMergeProposal(uint256 plotId1, uint256 plotId2, PlotDetails memory merge) external {
        require(_isOwner(plotId1, msg.sender) || _isOwner(plotId2, msg.sender), "Not an owner");

        MergeProposalData memory mergeData = MergeProposalData({ merge: merge, plotId1: plotId1, plotId2: plotId2 });
        bytes memory encodedData = abi.encode(mergeData);

        address[] memory owners1 = _getOwners(plotId1);
        address[] memory owners2 = _getOwners(plotId2);

        address[] memory hasToApprove = _mergeUnique(owners1, owners2);

        _createProposal(plotId1, ProposalType.Merge, hasToApprove, encodedData);
    }

    function createTransferProposal(uint256 plotId, PlotDetails memory transfer) external {
        require(_isOwner(plotId, msg.sender), "Not an owner");

        TransferProposalData memory transferData = TransferProposalData({ transfer: transfer });
        bytes memory encodedData = abi.encode(transferData);
        _createProposal(plotId, ProposalType.Transfer, _getOwners(plotId), encodedData);
    }

    function _createProposal(uint256 plotId, ProposalType proposalType, address[] memory hasToApprove, bytes memory proposalData) internal {
        require(_isOwner(plotId, msg.sender), "Not an owner");

        proposalCount++;
        Proposal storage proposal = proposals[proposalCount];
        proposal.plotId = plotId;
        proposal.proposalType = proposalType;
        proposal.proposalData = proposalData;
        proposal.hasToApprove = hasToApprove;
        proposal.executed = false;

        emit ProposalCreated(plotId, proposalCount);
    }

    function approveProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(!proposal.executed, "Proposal already executed");
        require(_hasToApprove(proposalId, msg.sender), "Can not approve");
        require(!proposal.approvals[msg.sender], "Already approved");

        proposal.approvals[msg.sender] = true;
        proposal.approvers.push(msg.sender);

        emit ProposalApproved(proposal.plotId, proposalId, msg.sender);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");

        for (uint256 i = 0; i < proposal.hasToApprove.length; i++) {
            if (!_contains(proposal.approvers, proposal.hasToApprove[i])) {
                revert("Not all owners have approved");
            }
        }

        if (proposal.proposalType == ProposalType.Split) {
            SplitProposalData memory splitData = abi.decode(proposal.proposalData, (SplitProposalData));
            _executeProposalSplit(proposal.plotId, splitData);
        } else if (proposal.proposalType == ProposalType.Merge) {
            MergeProposalData memory mergeData = abi.decode(proposal.proposalData, (MergeProposalData));
            _executeProposalMerge(mergeData);
        } else if (proposal.proposalType == ProposalType.Transfer) {
            TransferProposalData memory transferData = abi.decode(proposal.proposalData, (TransferProposalData));
            _executeProposalTransfer(proposal.plotId, transferData);
        } else {
            revert("Invalid proposal type");
        }
        proposal.executed = true;

        emit ProposalExecuted(proposal.plotId, proposalId);
    }

    function _executeProposalSplit(uint256 plotId, SplitProposalData memory splitData) internal {
        _mintPlot(splitData.split1);
        _mintPlot(splitData.split2);

        _burn(plotId);
        delete plots[plotId];
    }

    function _executeProposalMerge(MergeProposalData memory mergeData) internal {
        _mintPlot(mergeData.merge);
        _burn(mergeData.plotId1);
        _burn(mergeData.plotId2);
        delete plots[mergeData.plotId1];
        delete plots[mergeData.plotId2];
    }

    function _executeProposalTransfer(uint256 plotId, TransferProposalData memory transfer) internal {
        _mintPlot(transfer.transfer);
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
        newPlot.allowIndividualTransfer = plotDetails.allowIndividualTransfer;

        for (uint256 i = 0; i < plotDetails.owners.length; i++) {
            newPlot.owners.push(Ownership({ owner: plotDetails.owners[i], share: plotDetails.shares[i] }));
        }
    }

    // Internal helper to check ownership
    function _isOwner(uint256 tokenId, address account) public view returns (bool) {
        return _contains(_getOwners(tokenId), account);
    }

    function _hasToApprove(uint256 proposalId, address account) public view returns (bool) {
        return _contains(proposals[proposalId].hasToApprove, account);
    }

    function _getOwners(uint256 tokenId) public view returns (address[] memory) {
        address[] memory owners = new address[](plots[tokenId].owners.length);
        for (uint256 i = 0; i < owners.length; i++) {
            owners[i] = plots[tokenId].owners[i].owner;
        }

        return owners;
    }

    function _contains(address[] memory arr, address item) internal pure returns (bool) {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == item) {
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

    function _mergeUnique(address[] memory arr1, address[] memory arr2) internal pure returns (address[] memory) {
        uint256 uniqueCount = arr1.length;
        for (uint256 i = 0; i < arr2.length; i++) {
            if (!_contains(arr1, arr2[i])) {
                uniqueCount++;
            }
        }

        address[] memory result = new address[](uniqueCount);
        for (uint256 i = 0; i < arr1.length; i++) {
            result[i] = arr1[i];
        }

        uint256 resultIndex = arr1.length;
        for (uint256 i = 0; i < arr2.length; i++) {
            if(!_contains(arr1, arr2[i])) {
                result[resultIndex] = arr2[i];
                resultIndex++;
            }
        }

        return result;
    }
}
