const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying contracts...");

    // Deploy DIDRegistry contract
    const DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    const didRegistry = await DIDRegistry.deploy();
    await didRegistry.waitForDeployment();
    console.log("DIDRegistry deployed to:", await didRegistry.getAddress());

    // Deploy TrustEstate contract
    const [government, owner, addr1, addr2, addr3] = await ethers.getSigners();
    const TrustEstate = await ethers.getContractFactory("TrustEstate");
    const landRegistry = await TrustEstate.deploy(
        "TrustEstate",
        "TE",
        await government.getAddress(),
        await didRegistry.getAddress()
    );
    await landRegistry.waitForDeployment();
    console.log("TrustEstate deployed to:", await landRegistry.getAddress());

    // Register DIDs for test addresses
    console.log("Registering DIDs...");
    await didRegistry.connect(owner).register("did:example:owner", "test doc", true);
    await didRegistry.connect(addr1).register("did:example:addr1", "test doc", true);
    await didRegistry.connect(addr2).register("did:example:addr2", "test doc", true);
    await didRegistry.connect(addr3).register("did:example:addr3", "test doc", false);

    console.log("Linking DIDs to TrustEstate...");
    await landRegistry.connect(owner).register("did:example:owner");
    await landRegistry.connect(addr1).register("did:example:addr1");
    // await landRegistry.connect(addr2).register("did:example:addr2");
    await landRegistry.connect(addr3).register("did:example:addr3");

    // Save the deployed addresses and ABIs
    await saveContractData("DIDRegistry", didRegistry);
    await saveContractData("TrustEstate", landRegistry);


    // Create Test data
    const owners = [
        { owner: owner.address, share: 6000 },
        { owner: addr1.address, share: 4000 }
    ];
    const ipfsHash = "QmTestHash12345";
    const allowIndividualTransfer = true;

    await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer)

    const split1 = {
        ipfsHash: "QmSplitHash1",
        allowIndividualTransfer: true
    };
    const split2 = {
        ipfsHash: "QmSplitHash2",
        allowIndividualTransfer: true
    };

    const owners1 = [{ owner: owner.address, share: 10000 }];
    const owners2 = [{ owner: addr1.address, share: 10000 }];

    await landRegistry.connect(addr1).createSplitProposal(0, split1, split2, owners1, owners2);
    await landRegistry.connect(addr1).createSplitProposal(0, split1, split2, owners1, owners2);
    await landRegistry.connect(addr1).createSplitProposal(0, split1, split2, owners1, owners2);
    await landRegistry.connect(addr1).createSplitProposal(0, split1, split2, owners1, owners2);

    console.log("Deployment and setup complete!");

}

async function saveContractData(contractName, contractInstance) {
    const filePath = path.join(__dirname, "../frontend/src/assets/addresses/addresses.json");

    // Load existing data or initialize a new object
    let contractData = {};
    if (fs.existsSync(filePath)) {
        contractData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    // Add the new contract information
    const abi = contractInstance.interface.format();
    const address = await contractInstance.getAddress();

    contractData[contractName] = {
        address: address,
        abi: abi, // Automatically formats to JSON
    };

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
    console.log(`${contractName} address and ABI saved to ${filePath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error during deployment:", error);
        process.exit(1);
    });

