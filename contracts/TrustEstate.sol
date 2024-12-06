// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DIDRegistry.sol";
import "hardhat/console.sol"; //TODO: Remove

contract TrustEstate {
    struct Ownership {
        address owner; // wallet Adresse, Datentyp adress ist immer wallet adresse
        uint256 share;
    }

    DIDRegistry public didRegistry;

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

    struct ProposalView {
        uint256 proposalId;
        uint256 plotId;              // Plot ID for action
        address[] hasToApprove;      // List of people who have to approve
        address[] approvers;         // List of owners who approved
        ProposalType proposalType;   // Type of proposal (e.g., Split, Merge)
        bool executed;               // Whether the action is executed
        bytes proposalData;          // Encoded data specific to the proposal type
    }

    struct SplitProposalData {
        PlotDetails split1;      // Split data for the action
        PlotDetails split2;      // Split data for the action
        Ownership[] owners1;     // Owners for the first plot
        Ownership[] owners2;     // Owners for the second plot
    }

    struct MergeProposalData {
        PlotDetails merge;  // Merged plot data
        Ownership[] owners; // Owners for the merged plot
        uint256 plotId1;
        uint256 plotId2;
    }

    struct TransferProposalData {
        Ownership[] owners;
    }

    struct PlotDetails {
        string ipfsHash;
        bool allowIndividualTransfer;
    }

    struct Plot {
        uint256 id; // Unique governmental ID
        string ipfsHash; // Hash of geospatial data stored on IPFS
        bool allowIndividualTransfer; // Whether or not the land can be sold individually
    }

    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    // Mandatory participant for Merge / Split
    address private _madatoryPartitcipant;

    // TODO: Add a reverse mapping from owner address to plotId, to retrieve plots by owner
    mapping(uint256 plotId => Ownership[]) private _owners;

    mapping(uint256 plotId => Plot) private _plots;
    uint256 private _plotCount;

    mapping(uint256 proposalId => Proposal) public proposals;
    uint256 private _proposalCount;

    mapping(address owner => string did) public dids;

    event ProposalCreated(uint256 plotId, uint256 proposalId);
    event ProposalApproved(uint256 plotId, uint256 proposalId, address approver);
    event ProposalExecuted(uint256 plotId, uint256 proposalId);
    event Transfer(uint256 plotId, Ownership[] from, Ownership[] to);

    constructor(
        string memory name_, 
        string memory symbol_,
        address madatoryPartitcipant,
        address didRegistryAddress
    ) {
        _name = name_;
        _symbol = symbol_;
        _madatoryPartitcipant = madatoryPartitcipant;
        didRegistry = DIDRegistry(didRegistryAddress);
    }

    function register(string calldata did) public {
        dids[msg.sender] = did;
    }

    function getPlot(uint256 id) external view returns (Plot memory) {
        return _plots[id];
    }

    function getProposals() external view returns (ProposalView[] memory) {
        ProposalView[] memory ret = new ProposalView[](_proposalCount);
        for (uint i = 0; i < _proposalCount; i++) {
            Proposal storage proposal = proposals[i];
            ret[i] = ProposalView({
                proposalId: i,
                plotId: proposal.plotId,
                hasToApprove: proposal.hasToApprove,
                approvers: proposal.approvers,
                proposalType: proposal.proposalType,
                executed: proposal.executed,
                proposalData: proposal.proposalData
            });
            console.log("test", proposal.plotId);
        }
        return ret;
    }

    function mintPlot(
        Ownership[] calldata owners,
        string calldata ipfsHash,
        bool allowIndividualTransfer
    ) public {
        require(msg.sender == _madatoryPartitcipant, "Only the mandatory participant can mint plots");

        PlotDetails memory plot;
        plot.ipfsHash = ipfsHash;
        plot.allowIndividualTransfer = allowIndividualTransfer;

        _mint(plot, owners);
    }

    function transferOwnershipShare(address to, uint256 plotId, uint256 amount) public {
        require(_plots[plotId].id != 0, "LandToken: Transfer for nonexistent token");
        require(_isOwner(plotId, msg.sender), "Not an owner");
        uint256 shareOfCurrentOwner = _getShare(plotId, msg.sender);
        require(amount > shareOfCurrentOwner, "Not enough shares");
        require(_plots[plotId].allowIndividualTransfer, "Plot is not allowed to be individually transferred");

        uint256 ownerIndex = 0;
        for (uint256 i = 0; i < _owners[plotId].length; i++) {
            if (_owners[plotId][i].owner == msg.sender) {
                ownerIndex = i;
            }
        }
        // FIXME: Handle case an existing owner is transferred to another owner
        if (shareOfCurrentOwner == amount) {
            _owners[plotId][ownerIndex].owner = to;
        } else {
            _owners[plotId].push(Ownership({ owner: to, share: amount }));
            _owners[plotId][ownerIndex].share -= amount;
        }

        // TODO Emit event
    }

    function createSplitProposal(
        uint256 plotId,
        PlotDetails memory split1,
        PlotDetails memory split2,
        Ownership[] memory owners1,
        Ownership[] memory owners2
    ) external {
        console.log("createSplitProposal", plotId, msg.sender);
        for (uint i = 0; i < _owners[plotId].length; i++) {
            console.log(_owners[plotId][i].owner);
        }
        require(_isOwner(plotId, msg.sender), "Not an owner");
        _checkOwners(owners1);
        _checkOwners(owners2);

        console.log("works here");

        SplitProposalData memory splitData = SplitProposalData({
            split1: split1,
            split2: split2,
            owners1: owners1,
            owners2: owners2
        });
        bytes memory encodedData = abi.encode(splitData);
        console.log("works here");

        address[] memory hasToApprove = _addMandatoryParticipant(_getOwners(plotId));
        console.log("works here");

        _createProposal(plotId, ProposalType.Split, hasToApprove, encodedData);
        console.log("works here");
    }

    function getPlotCount() public view returns (uint256) {
        return _plotCount;
    }

    function createMergeProposal(
        uint256 plotId1,
        uint256 plotId2,
        PlotDetails memory merge,
        Ownership[] memory owners
    ) external {
        require(_isOwner(plotId1, msg.sender) || _isOwner(plotId2, msg.sender), "Not an owner");
        _checkOwners(owners);

        MergeProposalData memory mergeData = MergeProposalData({
            merge: merge,
            owners: owners,
            plotId1: plotId1,
            plotId2: plotId2
        });
        bytes memory encodedData = abi.encode(mergeData);

        address[] memory hasToApprove = _addMandatoryParticipant(_mergeUnique(_owners[plotId1], _owners[plotId2]));

        _createProposal(plotId1, ProposalType.Merge, hasToApprove, encodedData);
    }

    function createTransferProposal(uint256 plotId, Ownership[] memory owners) external {
        require(_isOwner(plotId, msg.sender), "Not an owner");
        _checkOwners(owners);

        TransferProposalData memory transferData = TransferProposalData({
            owners: owners
        });
        bytes memory encodedData = abi.encode(transferData);
        _createProposal(plotId, ProposalType.Transfer, _getOwners(plotId), encodedData);
    }

    function _createProposal(uint256 plotId, ProposalType proposalType, address[] memory hasToApprove, bytes memory proposalData) internal {
        require(_isOwner(plotId, msg.sender), "Not an owner");

        Proposal storage proposal = proposals[_proposalCount];
        proposal.plotId = plotId;
        proposal.proposalType = proposalType;
        proposal.proposalData = proposalData;
        proposal.hasToApprove = hasToApprove;
        proposal.executed = false;


        console.log("proposal created", _proposalCount, plotId);

        emit ProposalCreated(plotId, _proposalCount);

        _proposalCount++;
    }

    function approveProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(!proposal.executed, "Proposal already executed");
        require(_hasToApprove(proposalId, msg.sender), "Can not approve");
        require(!proposal.approvals[msg.sender], "Already approved");

        proposal.approvals[msg.sender] = true;
        proposal.approvers.push(msg.sender);

        emit ProposalApproved(proposal.plotId, proposalId, msg.sender);

        // TODO: Check if proposal is ready to be executed and execute it
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
        _mint(splitData.split1, splitData.owners1);
        _mint(splitData.split2, splitData.owners2);

        _burn(plotId);
    }
    
    function _burn(uint256 plotId) internal {
        delete _plots[plotId];
        delete _owners[plotId];
    }

    function _executeProposalMerge(MergeProposalData memory mergeData) internal {
        _mint(mergeData.merge, mergeData.owners);

        _burn(mergeData.plotId1);
        _burn(mergeData.plotId2);
    }

    function _executeProposalTransfer(uint256 plotId, TransferProposalData memory transfer) internal {
        delete _owners[plotId];

        for (uint256 i = 0; i < transfer.owners.length; i++) {
            _owners[plotId].push(transfer.owners[i]);
        }
    }

    // Internal helper to mint a new plot
    function _mint(PlotDetails memory plotDetails, Ownership[] memory owners) internal {
        _checkOwners(owners);


        Plot storage newPlot = _plots[_plotCount];
        newPlot.id = _plotCount;
        newPlot.ipfsHash = plotDetails.ipfsHash;
        newPlot.allowIndividualTransfer = plotDetails.allowIndividualTransfer;

        _plots[_plotCount] = newPlot;

        delete _owners[_plotCount];

        for (uint256 i = 0; i < owners.length; i++) {
            _owners[_plotCount].push(owners[i]);
        }

        emit Transfer(_plotCount, new Ownership[](0), owners);

        _plotCount++;

    }

    // Internal helper to check ownership
    function _isOwner(uint256 tokenId, address account) public view returns (bool) {
        return _isOwnerInArray(account, _owners[tokenId]);
    }

    function _isOwnerInArray(address account, Ownership[] memory owners) public pure returns (bool) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i].owner == account) {
                return true;
            }
        }

        return false;
    }

    function _hasToApprove(uint256 proposalId, address account) public view returns (bool) {
        return _contains(proposals[proposalId].hasToApprove, account);
    }

    function getOwnership(uint256 tokenId) external view returns (Ownership[] memory) {
        return _owners[tokenId];
    }

    function _getOwners(uint256 tokenId) public view returns (address[] memory) {
        address[] memory owners = new address[](_owners[tokenId].length);

        for (uint256 i = 0; i < owners.length; i++) {
            owners[i] = _owners[tokenId][i].owner;
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
        Ownership[] memory owners = _owners[tokenId];
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i].owner == account) {
                return owners[i].share;
            }
        }
        return 0;
    }

    function _mergeUnique(Ownership[] memory ownerships1, Ownership[] memory ownerships2) internal pure returns (address[] memory) {
        uint256 uniqueCount = ownerships1.length;
        for (uint256 i = 0; i < ownerships2.length; i++) {
            if (!_isOwnerInArray(ownerships2[i].owner, ownerships1)) {
                uniqueCount++;
            }
        }

        address[] memory result = new address[](uniqueCount);
        for (uint256 i = 0; i < ownerships1.length; i++) {
            result[i] = ownerships1[i].owner;
        }

        uint256 resultIndex = ownerships1.length;
        for (uint256 i = 0; i < ownerships2.length; i++) {
            if(!_isOwnerInArray(ownerships2[i].owner, ownerships1)) {
                result[resultIndex] = ownerships2[i].owner;
                resultIndex++;
            }
        }

        return result;
    }

    function _getTotalShares(uint256 plotId) internal view returns (uint256) {
        uint256 totalShares = 0;
        for (uint256 i = 0; i < _owners[plotId].length; i++) {
            totalShares += _owners[plotId][i].share;
        }
        return totalShares;
    }

    function _checkOwners(Ownership[] memory owners) internal view {
        require(owners.length > 0, "Owners must be non-empty");

        for (uint256 i = 0; i < owners.length; i++) {
            require(owners[i].share > 0, "Ownership share must be greater than 0");
            require(owners[i].owner != address(0), "Owner address must be non-zero");
        }

        address[] memory ownersAddresses = new address[](owners.length);
        for (uint256 i = 0; i < owners.length; i++) {
            ownersAddresses[i] = owners[i].owner;
        }
        require(_isUnique(ownersAddresses), "Owners must be unique");

        // Verify DIDs for all owners
        for (uint256 i = 0; i < owners.length; i++) {
            require(bytes(dids[owners[i].owner]).length > 0, "DID must be provided");
            require(didRegistry.verify(dids[owners[i].owner]), "Invalid DID");
            
            // Verify that the DID belongs to the owner's address
            require(
                didRegistry.isOwner(dids[owners[i].owner], owners[i].owner),
                "DID owner mismatch"
            );
        }
    }

    function _isUnique(address[] memory arr) internal pure returns (bool) {
        for (uint256 i = 0; i < arr.length; i++) {
            for (uint256 j = i + 1; j < arr.length; j++) {
                if (arr[i] == arr[j]) {
                    return false;
                }
            }
        }
        return true;
    }

    function _addMandatoryParticipant(address[] memory currentOwners) internal view returns (address[] memory) {
        address[] memory hasToApprove = new address[](currentOwners.length + 1);

        for (uint256 i = 0; i < currentOwners.length; i++) {
            hasToApprove[i] = currentOwners[i];
        }
        hasToApprove[currentOwners.length] = _madatoryPartitcipant;

        return hasToApprove;
    }
}

