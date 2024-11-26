const { Web3 } = require("web3");

const web3Instance = new Web3("http://127.0.0.1:8545/");

// Log the chain ID to the console to check the javascript blockchain setup
web3Instance.eth
  .getChainId()
  .then((result) => {
    console.log("Chain ID: " + result);
  })
  .catch((error) => {
    console.error(error);
  });