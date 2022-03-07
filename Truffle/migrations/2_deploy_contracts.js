const ConvertLib = artifacts.require("ConvertLib");
const DragonFactory = artifacts.require("dragonfactory");
const DragonOwnership = artifacts.require("dragonownership");
const MarketPlace = artifacts.require("marketplaceBoilerplate")
const DragonMinting = artifacts.require("dragonminting");
const DragonMerging = artifacts.require("dragonmerging");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.deploy(DragonFactory);
  deployer.deploy(DragonOwnership);
  deployer.deploy(MarketPlace);
  deployer.deploy(DragonMinting);
  deployer.deploy(DragonMerging);
};
