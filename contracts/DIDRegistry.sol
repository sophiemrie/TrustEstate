// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DIDRegistry {
    struct DID {
        address owner;
        string didDocument;  // IPFS hash of the DID Document
        bool isValid;
        mapping(string => string) verifiableCredentials; // credential type -> IPFS hash of VC
    }

    mapping(string did => DID) public dids; // did -> DID struct
    
    event DIDRegistered(string did, address owner);
    event DIDUpdated(string did, string newDocument);
    event CredentialAdded(string did, string credentialType, string vcHash);

    function register(string memory did, string memory didDocument, bool isValid) public {
        require(!dids[did].isValid, "DID already registered");
        
        DID storage newDID = dids[did];
        newDID.owner = msg.sender;
        newDID.didDocument = didDocument;
        newDID.isValid = isValid;
        
        emit DIDRegistered(did, msg.sender);
    }

    function updateDocument(string memory did, string memory newDocument) public {
        require(dids[did].isValid, "DID not registered");
        require(dids[did].owner == msg.sender, "Not DID owner");
        
        dids[did].didDocument = newDocument;
        
        emit DIDUpdated(did, newDocument);
    }

    function addVerifiableCredential(
        string memory did,
        string memory credentialType,
        string memory vcHash
    ) public {
        require(dids[did].isValid, "DID not registered");
        require(dids[did].owner == msg.sender, "Not DID owner");
        
        dids[did].verifiableCredentials[credentialType] = vcHash;
        
        emit CredentialAdded(did, credentialType, vcHash);
    }

    function verify(string memory did) public view returns (bool) {
        return dids[did].isValid;
    }

    function isOwner(string memory did, address owner) public view returns (bool) {
        return dids[did].owner == owner;
    }

    function getCredential(string memory did, string memory credentialType) public view returns (string memory) {
        require(dids[did].isValid, "DID not registered");
        return dids[did].verifiableCredentials[credentialType];
    }
}

