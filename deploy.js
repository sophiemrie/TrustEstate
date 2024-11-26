const { Web3 } = require("web3");
const path = require("path");
const fs = require("fs");

// ABI and Bytecode paths
const abiPath = path.join(__dirname, "TrustEstateAbi.json");
const bytecodePath = path.join(__dirname, "TrustEstateBytecode.bin");

// Load ABI and Bytecode
const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
const bytecode = fs.readFileSync(bytecodePath, "utf8");

// Create Web3 instance and connect to the local Ethereum node
const web3 = new Web3("http://127.0.0.1:8545");

async function deploy() {
  try {
    // Get accounts from the Ethereum node
    const accounts = await web3.eth.getAccounts();
    const deployerAccount = accounts[0];
    console.log("Deployer account:", deployerAccount);

    // Deploy the TrustEstate contract
    const TrustEstateContract = new web3.eth.Contract(abi);
    const contractDeployer = TrustEstateContract.deploy({
      data: "0x" + bytecode,
      arguments: ["TrustEstate", "TE", "0x9A676e781A523b5d0C0e43731313A708CB607508"], // Replace with actual DIDRegistry address
    });

    const gas = await contractDeployer.estimateGas({ from: deployerAccount });

    const trustEstateInstance = await contractDeployer.send({
      from: deployerAccount,
      gas,
      gasPrice: "10000000000",
    });

    console.log(
      "TrustEstate deployed at address:",
      trustEstateInstance.options.address
    );

    // Mock plot data
    console.log("Adding mock plot data...");
    const mockPlots = [
      {
        owners: [{ owner: deployerAccount, share: 100 }],
        ipfsHash: "MockPlot1_Hash",
        allowIndividualTransfer: true,
      },
      {
        owners: [
          { owner: deployerAccount, share: 50 },
          { owner: accounts[1], share: 50 },
        ],
        ipfsHash: "MockPlot2_Hash",
        allowIndividualTransfer: false,
      },
    ];

    for (const plot of mockPlots) {
      await trustEstateInstance.methods
        .mintPlot(plot.owners, plot.ipfsHash, plot.allowIndividualTransfer)
        .send({
          from: deployerAccount,
          gas: 3000000,
        });
      console.log(`Added plot with IPFS hash: ${plot.ipfsHash}`);
    }

    // Save deployed address to a file
    const deployedAddressesPath = path.join(__dirname, "DeployedAddresses.json");
    const deployedAddresses = { TrustEstate: trustEstateInstance.options.address };
    fs.writeFileSync(deployedAddressesPath, JSON.stringify(deployedAddresses, null, 2));

    console.log("Deployed addresses saved to:", deployedAddressesPath);
  } catch (error) {
    console.error("Error during deployment:", error);
  }
}

deploy();
