var SheetLibrary = artifacts.require("./SheetLibrary.sol")

module.exports = function(deployer) {
  // Use deployer to state migration tasks.
  deployer.deploy(SheetLibrary);
};
