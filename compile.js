const solc = require("solc");
const path = require("path");
const fs = require("fs");

// Contract names
const mainContractName = "TrustEstate";
const importedContractName = "DIDRegistry";

// File names
const mainFileName = `${mainContractName}.sol`;
const importedFileName = `${importedContractName}.sol`;

// Function to load file content
const loadContractFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error(`Error reading file at ${filePath}:`, err);
    process.exit(1);
  }
};

// Load the main contract and its imports
const mainContractPath = path.join(__dirname, "contracts", mainFileName);
const importedContractPath = path.join(__dirname, "contracts", importedFileName);

const sources = {
  [mainFileName]: {
    content: loadContractFile(mainContractPath),
  },
  [importedFileName]: {
    content: loadContractFile(importedContractPath),
  },
};

// solc compiler config
const input = {
  language: "Solidity",
  sources: sources,
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

// Compile the Solidity code
let compiledCode;
try {
  compiledCode = JSON.parse(solc.compile(JSON.stringify(input)));
  console.log("Compilation successful!");
} catch (err) {
  console.error("Error compiling the contract:", err);
  process.exit(1);
}

// Check for compilation errors
if (compiledCode.errors) {
  compiledCode.errors.forEach((error) => {
    if (error.severity === "error") {
      console.error("Compilation error:", error);
    } else {
      console.warn("Compilation warning:", error);
    }
  });
  process.exit(1); // Exit if there are any errors
}

// Helper function to save ABI and bytecode for a contract
const saveContractOutput = (contractName, fileName) => {
  const contractOutput = compiledCode.contracts[fileName][contractName];
  if (!contractOutput) {
    console.error(`Contract ${contractName} not found in compiled output.`);
    process.exit(1);
  }

  const bytecodePath = path.join(__dirname, `${contractName}Bytecode.bin`);
  const abiPath = path.join(__dirname, `${contractName}Abi.json`);

  try {
    fs.writeFileSync(bytecodePath, contractOutput.evm.bytecode.object);
    console.log(`Bytecode for ${contractName} written to:`, bytecodePath);
  } catch (err) {
    console.error(`Error writing bytecode file for ${contractName}:`, err);
  }

  try {
    fs.writeFileSync(abiPath, JSON.stringify(contractOutput.abi, null, 2));
    console.log(`ABI for ${contractName} written to:`, abiPath);
  } catch (err) {
    console.error(`Error writing ABI file for ${contractName}:`, err);
  }
};

// Save outputs for both contracts
saveContractOutput(mainContractName, mainFileName);
saveContractOutput(importedContractName, importedFileName);
