var DeliveryService = artifacts.require("./service/DeliveryService.sol")

var owners = [
  "0xe76842888177cb81ce9be7af9033876d5de2b5aa",
  "0x4c3b31b8385eaca26561eb6ff4e5ab50f0008d36",
];

module.exports = function(deployer) {
  deployer.deploy(DeliveryService, owners, 2)
};
