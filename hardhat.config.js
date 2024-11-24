require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.27",
    gasReporter: {
        enabled: (process.env.REPORT_GAS) ? true : false
    }
};
