const hre = require("hardhat");

async function main() {
  // Compile the contracts
  await hre.run("compile");

  // Deploy the DIDRegistry contract first
  const DIDRegistry = await hre.ethers.getContractFactory("DIDRegistry");
  const didRegistry = await DIDRegistry.deploy();
  await didRegistry.deployed();
  console.log("DIDRegistry deployed to:", didRegistry.address);

  // Deploy the TrustEstate contract
  const TrustEstate = await hre.ethers.getContractFactory("TrustEstate");
  const trustEstate = await TrustEstate.deploy("TrustEstate", "TE", didRegistry.address);
  await trustEstate.deployed();
  console.log("TrustEstate deployed to:", trustEstate.address);

  // Populate mock data
  console.log("Adding mock plots...");
  await trustEstate.mintPlot(
    [
      { owner: "0xYourOwnerAddressHere", share: 100 },
    ],
    "MockPlot1_IPFS_Hash",
    true
  );
  await trustEstate.mintPlot(
    [
      { owner: "0xYourOwnerAddressHere", share: 50 },
      { owner: "0xAnotherOwnerAddressHere", share: 50 },
    ],
    "MockPlot2_IPFS_Hash",
    false
  );

  const plotCount = await trustEstate.getPlotCount();
  console.log(`Total Plots Created: ${plotCount}`);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
